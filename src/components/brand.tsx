/**
 * Identidad de la tienda.
 *
 * No se dibuja ningun isotipo inventado: el logotipo real lo sube el
 * propietario desde el panel (Ajustes > Marca) y se guarda como imagen. Sin
 * logo cargado se muestra unicamente el nombre en la tipografia de la marca,
 * que es una solucion valida y honesta en lugar de un simbolo generico.
 *
 * Si ademas hay un segundo logo, los dos se muestran juntos y quietos: esta
 * tienda tiene una sola marca, asi que no hay nada que turnar.
 */

import { MediaImage } from './media-image';
export function StoreLogo({
  logoUrl,
  secondaryLogoUrl = null,
  secondaryLogoAlt = '',
  storeName,
  className = '',
  inverted = false,
}: {
  logoUrl: string | null;
  secondaryLogoUrl?: string | null;
  secondaryLogoAlt?: string;
  storeName: string;
  className?: string;
  inverted?: boolean;
}) {
  // La altura se fija en la propia imagen y no con un `h-full` heredado: un
  // SVG sin ancho ni alto propios no puede resolver un porcentaje contra la
  // celda, resuelve contra su ancho y se sale del hueco. Como la cabecera esta
  // fija, ese sobrante quedaba flotando encima del contenido de la pagina.
  const sizeClass = 'h-7 sm:h-8';
  const widthClass = 'max-w-[130px] sm:max-w-[190px]';
  const imageClass = `${sizeClass} w-auto max-w-full object-contain object-left ${
    inverted ? 'brightness-0 invert' : ''
  }`;

  if (logoUrl && secondaryLogoUrl) {
    return (
      <span className={`flex items-center gap-3 ${sizeClass} ${className}`}>
        <MediaImage src={logoUrl} alt={storeName} sizes="320px" className={imageClass} />
        <MediaImage
          src={secondaryLogoUrl}
          alt={secondaryLogoAlt}
          aria-hidden={secondaryLogoAlt ? undefined : true}
          sizes="320px"
          className={imageClass}
        />
      </span>
    );
  }

  if (logoUrl) {
    return (
      <MediaImage
        src={logoUrl}
        alt={storeName}
        sizes="320px"
        className={`${imageClass} ${widthClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`block truncate font-display text-lg font-bold uppercase leading-none tracking-[0.1em] sm:text-2xl sm:tracking-[0.14em] ${className}`}
    >
      {storeName}
    </span>
  );
}
