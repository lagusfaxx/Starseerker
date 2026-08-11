import type { BannerVideo } from '@/lib/banner-style';

/**
 * Video de fondo de un banner, sin controles y sin sonido.
 *
 * Va detras del texto y no debe capturar clics: el banner completo se
 * comporta como una imagen. El autoplay solo lo permiten los navegadores si
 * el video esta silenciado, de ahi `muted`.
 */
export function BannerVideo({ video, poster }: { video: BannerVideo; poster?: string | null }) {
  if (video.kind === 'embed') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/*
          El iframe llega en 16:9: se agranda hasta cubrir el banner y se
          centra, para que no queden franjas negras a los costados.

          Y despues se agranda un 30% mas. Eso no es estetico: `controls=0` le
          pide a YouTube que no dibuje su interfaz, pero es una peticion, no
          una garantia. YouTube la reactiva por su cuenta en cuanto el
          reproductor deja de estar reproduciendo —al pausarse, al reiniciar el
          bucle o al volver a la portada desde otra pagina, que es cuando se
          veian los controles— y ahi asoman la barra inferior y el titulo de
          arriba. Como el video es decorativo y el recorte no se nota, se
          agranda para que esa franja quede fuera del hueco visible: el
          contenedor tiene `overflow-hidden`, asi que aunque YouTube la dibuje
          nadie la ve.
        */}
        <iframe
          src={video.src}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.3] border-0"
        />
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
