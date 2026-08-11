/**
 * Presentacion de la imagen de un banner de portada.
 *
 * Vive aparte del componente porque lo usan tanto la portada (servidor) como
 * el formulario del panel (cliente).
 */

/** En que parte de la portada aparece el banner. */
export type BannerPlacement = 'hero' | 'destacado' | 'inferior';

/** Como se coloca la imagen dentro de la diapositiva. */
export type HeroImageMode = 'background' | 'side' | 'split' | 'splitLeft';

/** Los modos que parten el banner en dos mitades, texto y foto. */
export function isSplitMode(mode: HeroImageMode): boolean {
  return mode === 'split' || mode === 'splitLeft';
}

/** Cuanto se oscurece la foto para que el texto blanco se lea encima. */
export type HeroOverlay = 'none' | 'soft' | 'medium' | 'strong';

export const PLACEMENTS: { value: BannerPlacement; label: string; hint: string }[] = [
  {
    value: 'hero',
    label: 'Carrusel principal',
    hint: 'Arriba de todo, en la primera pantalla. Si hay varios se turnan solos.',
  },
  {
    value: 'destacado',
    label: 'Franja bajo "Mas vendidos"',
    hint: 'Banner ancho en medio de la portada. Si hay varios se apilan por orden.',
  },
  {
    value: 'inferior',
    label: 'Franja bajo "Colecciones"',
    hint: 'Mas abajo en la portada, tras la tira de colecciones. Si hay varios se apilan por orden.',
  },
];

export const IMAGE_MODES: { value: HeroImageMode; label: string; hint: string }[] = [
  {
    value: 'background',
    label: 'Fondo completo',
    hint: 'La foto ocupa todo el banner. Es lo habitual para fotografias.',
  },
  {
    value: 'side',
    label: 'A un costado',
    hint: 'La imagen se apoya a la derecha sobre un circulo claro. Para productos recortados con fondo transparente.',
  },
  {
    value: 'split',
    label: 'Mitad y mitad, foto a la derecha',
    hint: 'El texto ocupa la mitad izquierda sobre el color de fondo y la foto llena la otra mitad. En telefono la foto va arriba.',
  },
  {
    value: 'splitLeft',
    label: 'Mitad y mitad, foto a la izquierda',
    hint: 'Lo mismo pero al reves. Sirve para alternar cuando pones varias franjas seguidas.',
  },
];

export const OVERLAYS: { value: HeroOverlay; label: string }[] = [
  { value: 'none', label: 'Sin velo' },
  { value: 'soft', label: 'Suave' },
  { value: 'medium', label: 'Medio' },
  { value: 'strong', label: 'Fuerte' },
];

/**
 * Velo sobre la fotografia. El texto del hero es blanco, asi que una foto
 * clara sin velo lo deja ilegible.
 *
 * En pantallas grandes se oscurece mas por la izquierda, que es donde va el
 * titular, y la foto respira por la derecha. En el telefono el texto ocupa
 * todo el ancho, asi que el velo va de abajo hacia arriba.
 */
export const OVERLAY_CLASS: Record<HeroOverlay, string> = {
  none: '',
  soft: 'bg-gradient-to-t from-black/60 via-black/35 to-black/25 md:bg-gradient-to-r md:from-black/55 md:via-black/30 md:to-black/10',
  medium:
    'bg-gradient-to-t from-black/80 via-black/55 to-black/40 md:bg-gradient-to-r md:from-black/75 md:via-black/50 md:to-black/20',
  strong:
    'bg-gradient-to-t from-black/90 via-black/75 to-black/60 md:bg-gradient-to-r md:from-black/90 md:via-black/70 md:to-black/40',
};

/**
 * Decide si sobre un fondo hay que escribir en claro o en oscuro.
 *
 * Los fondos de banner se guardan como CSS, asi que pueden ser un color, un
 * degradado de la lista o cualquier cosa que el propietario pegue. En vez de
 * llevar una tabla de cuales son claros se miran los colores que aparecen en
 * el texto y se calcula su luminosidad media: asi un fondo nuevo funciona sin
 * tocar nada.
 *
 * Antes el texto era blanco pase lo que pase, asi que elegir un fondo claro
 * dejaba el titular ilegible y en la practica no se podia usar. Es lo que hacia
 * falta para poder tener franjas blancas en la portada.
 */
export function backgroundTone(css: string | null | undefined): 'light' | 'dark' {
  const colores = leerColores(css ?? '');
  if (colores.length === 0) return 'dark';

  const media = colores.reduce((suma, valor) => suma + valor, 0) / colores.length;
  // El umbral esta alto a proposito: ante un fondo intermedio conviene el texto
  // claro, que es el que ademas lleva velo cuando hay foto detras.
  return media > 0.62 ? 'light' : 'dark';
}

/** Luminosidad de cada color hexadecimal que aparezca en el CSS, de 0 a 1. */
function leerColores(css: string): number[] {
  const hallazgos = css.match(/#[0-9a-f]{3,8}\b/gi) ?? [];

  return hallazgos.flatMap((hex) => {
    const limpio = hex.slice(1);
    const completo =
      limpio.length === 3
        ? limpio
            .split('')
            .map((c) => c + c)
            .join('')
        : limpio.slice(0, 6);
    if (completo.length !== 6) return [];

    const r = parseInt(completo.slice(0, 2), 16) / 255;
    const g = parseInt(completo.slice(2, 4), 16) / 255;
    const b = parseInt(completo.slice(4, 6), 16) / 255;
    if ([r, g, b].some(Number.isNaN)) return [];

    // Luminosidad percibida: el ojo ve el verde mucho mas claro que el azul.
    return [0.2126 * r + 0.7152 * g + 0.0722 * b];
  });
}

/**
 * Colores del texto de un banner segun su fondo.
 *
 * `sobreFoto` es distinto de un fondo claro: cuando hay una fotografia o un
 * video detras, encima va un velo oscuro y el texto se queda en blanco aunque
 * el color de respaldo sea claro, porque lo que se ve es la foto.
 */
export function bannerTextClasses(background: string | null | undefined, sobreFoto: boolean) {
  const tono = sobreFoto ? 'dark' : backgroundTone(background);

  return tono === 'light'
    ? {
        eyebrow: 'text-black/60',
        title: 'text-black',
        subtitle: 'text-black/70',
        subtitleBold: 'font-semibold text-black',
        cta: 'btn-invert',
        arrows: 'text-black/60 hover:text-black',
      }
    : {
        eyebrow: 'text-brand',
        title: 'text-ink',
        subtitle: 'text-white/80',
        subtitleBold: 'font-semibold text-white',
        cta: 'btn-primary',
        arrows: 'text-white/80 hover:text-brand',
      };
}

/**
 * Video de fondo de un banner.
 *
 * Un archivo directo se reproduce con `<video>`, que es la unica forma de
 * garantizar que no aparezca ningun control: los dibuja el navegador solo si
 * se los pides. YouTube y Vimeo hay que incrustarlos por iframe, y ahi la
 * interfaz la decide su reproductor; lo unico que se puede hacer es pedirle
 * que no la muestre y no darle motivos para hacerlo.
 */
export type BannerVideo =
  | { kind: 'file'; src: string }
  /**
   * `provider` no es decorativo: YouTube necesita que alguien lo rebobine
   * desde el navegador (ver mas abajo por que) y Vimeo no.
   */
  | { kind: 'embed'; src: string; provider: 'youtube' | 'vimeo' };

/**
 * De donde sale el video, antes de decidir con que parametros se incrusta.
 *
 * El mismo enlace sirve para un fondo mudo y para un video con controles, y
 * lo unico que cambia entre ambos son los parametros de la URL: separar el
 * reconocimiento del proveedor evita repetir estas expresiones regulares.
 */
export type VideoSource =
  | { kind: 'file'; src: string }
  | { kind: 'youtube'; id: string }
  | { kind: 'vimeo'; id: string };

function youtubeId(url: URL): string | null {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1) || null;
  if (!url.hostname.endsWith('youtube.com')) return null;
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const embedded = url.pathname.match(/^\/(?:embed|shorts|v)\/([^/]+)/);
  return embedded?.[1] ?? null;
}

function vimeoId(url: URL): string | null {
  if (!url.hostname.endsWith('vimeo.com')) return null;
  return url.pathname.match(/\/(\d+)/)?.[1] ?? null;
}

export function parseVideoSource(value: string | null | undefined): VideoSource | null {
  const raw = value?.trim();
  if (!raw) return null;

  // Una ruta interna solo puede ser un archivo servido por la propia tienda.
  if (raw.startsWith('/') && !raw.startsWith('//')) return { kind: 'file', src: raw };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const youtube = youtubeId(url);
  if (youtube) return { kind: 'youtube', id: youtube };

  const vimeo = vimeoId(url);
  if (vimeo) return { kind: 'vimeo', id: vimeo };

  return { kind: 'file', src: raw };
}

export function toBannerVideo(value: string | null | undefined): BannerVideo | null {
  const source = parseVideoSource(value);
  if (!source) return null;

  if (source.kind === 'youtube') {
    /*
     * Falta `loop=1` a proposito, y con el `playlist=<id>`, que es la forma
     * habitual de hacer que un video de YouTube se repita.
     *
     * Esa pareja es justo lo que dibujaba los controles encima del banner. Un
     * video con `playlist` deja de ser un video para YouTube y pasa a ser una
     * lista de reproduccion, y a una lista le pone sus flechas de anterior y
     * siguiente en los costados. Esas flechas no las quita `controls=0`, que
     * solo se ocupa de la barra de abajo, ni las tapa recortar los bordes,
     * porque van centradas a media altura.
     *
     * Asi que el bucle se hace por fuera: `enablejsapi=1` deja que la pagina
     * hable con el reproductor, y `YoutubeBackground` lo rebobina cuando el
     * video termina. Para YouTube sigue siendo un video suelto y no tiene
     * ninguna flecha que dibujar.
     */
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      controls: '0',
      playsinline: '1',
      modestbranding: '1',
      rel: '0',
      disablekb: '1',
      fs: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
    });
    return {
      kind: 'embed',
      provider: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${source.id}?${params}`,
    };
  }

  if (source.kind === 'vimeo') {
    const params = new URLSearchParams({
      autoplay: '1',
      muted: '1',
      loop: '1',
      background: '1',
      controls: '0',
    });
    return {
      kind: 'embed',
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${source.id}?${params}`,
    };
  }

  return { kind: 'file', src: source.src };
}

export function toPlacement(value: string | null | undefined): BannerPlacement {
  const known = PLACEMENTS.find((option) => option.value === value);
  return known?.value ?? 'hero';
}

export function toImageMode(value: string | null | undefined): HeroImageMode {
  const known = IMAGE_MODES.find((option) => option.value === value);
  return known?.value ?? 'background';
}

export function toOverlay(value: string | null | undefined): HeroOverlay {
  return value === 'none' || value === 'soft' || value === 'strong' || value === 'medium'
    ? value
    : 'medium';
}
