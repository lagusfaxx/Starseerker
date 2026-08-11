'use client';

import { useEffect, useRef, useState } from 'react';

const ORIGIN = 'https://www.youtube-nocookie.com';

/** Los estados que manda el reproductor. */
const REPRODUCIENDO = 1;
const TERMINADO = 0;

/**
 * Cuanto se espera a que el reproductor avise de que arranco.
 *
 * Si no dice nada en ese plazo se muestra igual. Vale mas un video con un
 * parpadeo de su interfaz que un banner que se queda para siempre con el
 * cartel de fondo porque el navegador bloqueo el dialogo con YouTube.
 */
const ESPERA_MAXIMA_MS = 4000;

/**
 * Iframe de YouTube que se repite y que no se muestra hasta que arranca.
 *
 * Dos problemas distintos del reproductor de YouTube, con la misma raiz: la
 * interfaz la dibuja el, no nosotros, y solo se le puede pedir que no la
 * muestre.
 *
 * El primero eran las flechas de anterior y siguiente. Aparecian porque el
 * bucle se hacia con `loop=1&playlist=<id>`, y con `playlist` el reproductor
 * deja de tratarlo como un video suelto y le pone su navegacion de lista. Aqui
 * el bucle se hace desde la pagina: con `enablejsapi=1` el reproductor acepta
 * ordenes por `postMessage`, y cuando avisa que termino se le pide volver al
 * principio.
 *
 * El segundo era el boton de pausa durante los primeros segundos. Ese no se
 * puede quitar con parametros: el reproductor lo dibuja mientras carga, antes
 * de empezar, y `controls=0` solo se aplica una vez que esta reproduciendo.
 * Asi que el iframe se mantiene invisible y aparece cuando el propio
 * reproductor avisa de que ya esta reproduciendo. Lo que se ve entretanto es
 * el cartel del banner o su color de fondo, que es lo que se veia igual
 * mientras el video cargaba.
 */
export function YoutubeBackground({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    function enviar(mensaje: Record<string, unknown>) {
      iframe?.contentWindow?.postMessage(JSON.stringify(mensaje), ORIGIN);
    }

    // El reproductor no avisa de nada hasta que alguien se lo pide, y no
    // escucha hasta que termina de cargar. Se insiste unas cuantas veces
    // porque no hay forma de saber desde fuera cuando quedo listo: el `onload`
    // del iframe se dispara antes de que el reproductor exista.
    const suscribir = () => enviar({ event: 'listening', id: 1, channel: 'widget' });
    suscribir();
    const reintentos = window.setInterval(suscribir, 500);
    const alta = window.setTimeout(() => window.clearInterval(reintentos), 10000);

    // Red de seguridad: si el dialogo no funciona, el video se muestra igual.
    const rendicion = window.setTimeout(() => setVisible(true), ESPERA_MAXIMA_MS);

    function alRecibir(evento: MessageEvent) {
      if (evento.origin !== ORIGIN) return;

      let dato: { event?: string; info?: unknown };
      try {
        dato = typeof evento.data === 'string' ? JSON.parse(evento.data) : evento.data;
      } catch {
        return;
      }
      if (dato?.event !== 'onStateChange') return;

      // El estado llega suelto en unos mensajes y dentro de `playerState` en
      // otros, segun la version del reproductor.
      const estado =
        typeof dato.info === 'number'
          ? dato.info
          : (dato.info as { playerState?: number } | undefined)?.playerState;

      if (estado === REPRODUCIENDO) {
        window.clearInterval(reintentos);
        setVisible(true);
      }

      if (estado === TERMINADO) {
        enviar({ event: 'command', func: 'seekTo', args: [0, true] });
        enviar({ event: 'command', func: 'playVideo', args: [] });
      }
    }

    window.addEventListener('message', alRecibir);
    return () => {
      window.removeEventListener('message', alRecibir);
      window.clearInterval(reintentos);
      window.clearTimeout(alta);
      window.clearTimeout(rendicion);
    };
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title=""
      tabIndex={-1}
      allow="autoplay; encrypted-media; picture-in-picture"
      // La transicion entra despues, para que el video no aparezca de golpe
      // sobre el cartel. `visibility` acompana a la opacidad para que un
      // iframe todavia invisible no reciba nada del raton.
      className={`${className ?? ''} transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'invisible opacity-0'
      }`}
    />
  );
}
