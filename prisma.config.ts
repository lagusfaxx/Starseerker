import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

/**
 * Configuración de Prisma 7. La URL de conexión vive aquí (ya no en el schema)
 * y la usa el CLI para migraciones; el cliente en runtime la recibe vía adapter
 * en src/lib/prisma.ts.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
