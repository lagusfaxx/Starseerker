import Link from "next/link";

/**
 * Marca de la tienda.
 *
 * Si en Ajustes hay un `logoUrl` se usa esa imagen (basta con dejar el archivo
 * en `public/` y escribir `/logo.svg`). Mientras no lo haya, se muestra el
 * logotipo tipográfico, sin iconos ni placeholders.
 */
export function Logo({
  logoUrl,
  logoHeight = 28,
  storeName = "STARSEEKER",
  href = "/",
  className = "",
}: {
  logoUrl?: string;
  logoHeight?: number;
  storeName?: string;
  href?: string | null;
  className?: string;
}) {
  const content = logoUrl ? (
    // Sin next/image: el logo es un archivo propio y liviano, y así se evita
    // el salto de layout que produce la optimización en la cabecera.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={storeName}
      style={{ height: logoHeight }}
      className="w-auto"
      decoding="async"
    />
  ) : (
    <span className="flex items-baseline gap-2 leading-none">
      <span className="text-[19px] font-semibold tracking-[0.26em] sm:text-[21px]">
        STARSEEKER
      </span>
      <span className="hidden text-[10px] font-medium tracking-[0.32em] text-mute sm:inline">
        CHILE
      </span>
    </span>
  );

  if (!href) return <div className={className}>{content}</div>;

  return (
    <Link href={href} className={`inline-flex items-center ${className}`} aria-label={storeName}>
      {content}
    </Link>
  );
}
