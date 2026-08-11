'use client';

import { useEffect, useRef } from 'react';

const ORIGIN = 'https://www.youtube-nocookie.com';

/** Los estados que manda el reproductor. Solo interesa el final. */
const TERMINADO = 0;

/**
 * Iframe de YouTube que se repite sin convertirse en lista de reproduccion.
 *
 * La forma habitual de repetir un video de YouTube es `loop=1&playlist=<id>`,
 * y es la que dibujaba las flechas de anterior y siguiente encima del banner:
 * con `playlist` el reproductor deja de tratarlo como un video suelto. Esas
 * flechas van centradas a media altura, asi que ni `controls=0` ni recortar
 * los bordes las quitan.
 *
 * Aqui el bucle se hace desde la pagina. Con `enablejsapi=1` el reproductor
 * acepta ordenes por `postMessage`; se le pide que avise de sus cambios de
 * estado y, cuando dice que termino, se le manda volver al principio y seguir.
 * Para YouTube nunca deja de ser un video suelto.
 *
 * Si el dialogo falla —el navegador bloquea el mensaje, YouTube cambia el
 * protocolo— lo que se pierde es la repeticion, no el video: se reproduce una
 * vez y se queda quieto. Es un fallo aceptable para algo decorativo.
 */
export function YoutubeBackground({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    function enviar(mensaje: Record<string, unknown>) {
      iframe?.contentWindow?.postMessage(JSON.stringify(mensaje), ORIGIN);
    }

    // El reproductor no avisa de nada hasta que alguien se lo pide, y no
    // escucha hasta que termina de cargar. Se insiste unas cuantas veces
    // porque no hay forma de saber desde fuera cuando quedo listo: `onload`
    // del iframe se dispara antes de que el reproductor exista.
    const suscribir = () => enviar({ event: 'listening', id: 1, channel: 'widget' });
    suscribir();
    const reintentos = window.setInterval(suscribir, 1000);
    const alta = window.setTimeout(() => window.clearInterval(reintentos), 10000);

    function alRecibir(evento: MessageEvent) {
      if (evento.origin !== ORIGIN) return;

      let dato: { event?: string; info?: unknown };
      try {
        dato = typeof evento.data === 'string' ? JSON.parse(evento.data) : evento.data;
      } catch {
        return;
      }

      // El estado llega suelto en unos mensajes y dentro de `playerState` en
      // otros, segun la version del reproductor.
      const estado =
        typeof dato?.info === 'number'
          ? dato.info
          : (dato?.info as { playerState?: number } | undefined)?.playerState;

      if (dato?.event === 'onStateChange' && estado === TERMINADO) {
        enviar({ event: 'command', func: 'seekTo', args: [0, true] });
        enviar({ event: 'command', func: 'playVideo', args: [] });
      }
    }

    window.addEventListener('message', alRecibir);
    return () => {
      window.removeEventListener('message', alRecibir);
      window.clearInterval(reintentos);
      window.clearTimeout(alta);
    };
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title=""
      tabIndex={-1}
      allow="autoplay; encrypted-media; picture-in-picture"
      className={className}
    />
  );
}
