#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Arranque del contenedor en Coolify.
#
# 1. Valida las variables imprescindibles.
# 2. Espera a que PostgreSQL acepte conexiones.
# 3. Aplica las migraciones pendientes.
# 4. Siembra los datos iniciales solo si la tienda está vacía (RUN_SEED=true
#    fuerza el seed, RUN_SEED=false lo desactiva).
# 5. Cede el control al servidor de Next.
# ---------------------------------------------------------------------------

fail() {
  echo "✗ $1"
  exit 1
}

[ -n "$DATABASE_URL" ] || fail "DATABASE_URL no está configurado. Revisa las variables del servicio en Coolify."
[ -n "$AUTH_SECRET" ] || fail "AUTH_SECRET no está configurado: el panel no podría iniciar sesión."

# `pg` está en el node_modules del build standalone.
db_query() {
  node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client
  .connect()
  .then(() => client.query(process.argv[1]))
  .then((result) => { if (result.rows[0]) console.log(Object.values(result.rows[0])[0]); return client.end(); })
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
" "$1"
}

echo "→ Esperando a PostgreSQL…"
attempt=0
until db_query "SELECT 1" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 60 ] || fail "PostgreSQL no respondió tras 60 intentos (2 minutos)."
  sleep 2
done
echo "✓ PostgreSQL disponible."

echo "→ Aplicando migraciones…"
(cd /app/tools && node node_modules/prisma/build/index.js migrate deploy --schema /app/prisma/schema.prisma)

SHOULD_SEED="${RUN_SEED:-auto}"
if [ "$SHOULD_SEED" = "auto" ]; then
  PRODUCTS=$(db_query 'SELECT COUNT(*)::int FROM "Product"' 2>/dev/null || echo "")
  if [ "$PRODUCTS" = "0" ]; then
    SHOULD_SEED=true
  else
    SHOULD_SEED=false
  fi
fi

if [ "$SHOULD_SEED" = "true" ]; then
  echo "→ Sembrando datos iniciales (admin, categorías, zonas de despacho)…"
  node /app/seed.mjs || echo "⚠ El seed falló; la aplicación arranca igualmente."
elif [ "${RUN_SEED:-auto}" = "auto" ]; then
  echo "→ La base ya tiene datos: se omite el seed."
else
  echo "→ Seed desactivado (RUN_SEED=false)."
fi

echo "✓ Arrancando STARSEEKER Chile en el puerto ${PORT:-3000}."
exec "$@"
