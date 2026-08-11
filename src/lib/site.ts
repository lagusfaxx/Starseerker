/**
 * URL pública del sitio.
 *
 * Se lee en tiempo de ejecución (no `NEXT_PUBLIC_`, que Next hornea durante el
 * build) para que la misma imagen de Docker sirva en Coolify para producción,
 * staging o un dominio de prueba cambiando solo la variable de entorno.
 *
 * Coolify inyecta `SERVICE_FQDN_*` con el dominio asignado al servicio, así que
 * también lo aceptamos como origen.
 */
function coolifyFqdn(): string | undefined {
  // Coolify expone el dominio como SERVICE_FQDN_<SERVICIO>[_<PUERTO>].
  const entry = Object.entries(process.env).find(
    ([key, value]) => key.startsWith("SERVICE_FQDN_") && !!value,
  );
  return entry?.[1];
}

export function siteUrl(): string {
  const raw =
    process.env.APP_URL ||
    coolifyFqdn() ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://starseerker.cl";

  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}
