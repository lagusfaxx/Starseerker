# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# STARSEEKER Chile — imagen de producción para Coolify
#
# Etapas:
#   deps    → node_modules completos para compilar
#   builder → next build (output: standalone) + seed empaquetado con esbuild
#   tools   → instalación aislada del CLI de Prisma (solo para migrar)
#   runner  → imagen final: servidor Node, migraciones y seed de primer arranque
# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS base
# openssl lo necesita el motor de migraciones de Prisma.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


# --- Dependencias -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# El postinstall ejecuta `prisma generate`, por eso el schema va antes.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN npm ci


# --- Build ------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dominio público. Se pasa como build arg para que las URLs canónicas y los
# metadatos estáticos salgan correctos; en runtime APP_URL puede sobreescribirlo.
ARG APP_URL="https://starseerker.cl"
ENV APP_URL=${APP_URL}

# Prisma 7 no se conecta para generar el cliente, pero prisma.config.ts exige
# la variable: se usa un valor de relleno que nunca abre una conexión.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"

RUN npx prisma generate && npx next build

# El seed se empaqueta en un único .mjs sin dependencias de desarrollo:
# @prisma/client y pg quedan externos porque ya viven en el output standalone.
RUN npx esbuild prisma/seed.ts \
      --bundle --platform=node --format=esm --target=node22 \
      --outfile=seed.mjs \
      --external:@prisma/client --external:pg


# --- CLI de Prisma aislado --------------------------------------------------
# Se instala aparte para no mezclarlo con el node_modules del output standalone.
FROM base AS tools
WORKDIR /tools
COPY package.json ./app-package.json
RUN node -e "const p=require('./app-package.json');const d={...p.dependencies,...p.devDependencies};require('fs').writeFileSync('package.json',JSON.stringify({name:'starseerker-tools',private:true,version:'1.0.0',dependencies:{prisma:d.prisma}},null,2))" \
 && npm install --no-audit --no-fund --omit=dev \
 && rm app-package.json

# Config mínima en JavaScript: el CLI la lee sin necesitar un loader de TypeScript.
RUN printf '%s\n' \
  'import { defineConfig, env } from "prisma/config";' \
  '' \
  'export default defineConfig({' \
  '  datasource: { url: env("DATABASE_URL") },' \
  '});' \
  > prisma.config.mjs


# --- Runtime ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Servidor standalone + assets.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Seed empaquetado y migraciones.
COPY --from=builder --chown=nextjs:nodejs /app/seed.mjs ./seed.mjs
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/migrations ./prisma/migrations

# CLI de Prisma para `migrate deploy`.
COPY --from=tools --chown=nextjs:nodejs /tools ./tools

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
