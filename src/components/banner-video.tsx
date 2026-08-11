import type { BannerVideo } from '@/lib/banner-style';
import { MediaImage } from './media-image';
import { YoutubeBackground } from './youtube-background';

/** Cuanto se agranda el iframe mas alla de cubrir el hueco. */
const RECORTE = 'scale-[1.12]';

/**
 * Video de fondo de un banner, sin controles y sin sonido.
 *
 * Va detras del texto y no debe capturar clics: el banner completo se
 * comporta como una imagen. El autoplay solo lo permiten los navegadores si
 * el video esta silenciado, de ahi `muted`.
 */
export function BannerVideo({ video, poster }: { video: BannerVideo; poster?: string | null }) {
  if (video.kind === 'embed') {
    /*
     * El iframe llega en 16:9: se agranda hasta cubrir el banner y se centra,
     * para que no queden franjas negras a los costados. Y despues un poco mas,
     * lo justo para dejar fuera del hueco visible la franja de arriba, donde el
     * reproductor escribe el titulo del video cuando se detiene.
     *
     * Es un margen pequeno a proposito. Antes era mucho mayor, intentando tapar
     * tambien las flechas de anterior y siguiente, y no servia: iban centradas
     * a media altura, o sea justo donde nunca alcanza un recorte de los bordes.
     * Esas flechas ya no aparecen porque el bucle dejo de hacerse con una lista
     * de reproduccion (ver `toBannerVideo`), asi que no hay nada que tapar en el
     * centro y el video se puede mostrar casi entero.
     */
    const clases = `pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 ${RECORTE} border-0`;

    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/*
          El cartel va debajo del iframe y se queda ahi. Mientras el video de
          YouTube carga, el iframe esta invisible a proposito —es la unica forma
          de que no se vea su boton de pausa en los primeros segundos— y sin
          esta imagen lo que se veria entretanto es el color de fondo pelado.
        */}
        {poster ? (
          <MediaImage
            src={poster}
            alt=""
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}

        {video.provider === 'youtube' ? (
          <YoutubeBackground src={video.src} className={clases} />
        ) : (
          // Vimeo se repite solo con `loop=1` y no necesita que nadie lo
          // rebobine: su modo `background` esta pensado justo para esto.
          <iframe
            src={video.src}
            title=""
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            className={clases}
          />
        )}
      </div>
    );
  }

  return (
    <video
      aria-hidden="true"
      tabIndex={-1}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
    >
      <source src={video.src} />
    </video>
  );
}
