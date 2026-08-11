import { NextResponse } from 'next/server';
import {
  VIDEO_CHUNK_BYTES,
  getAssetChunk,
  getAssetMeta,
  getOptimizedImage,
  isVideoType,
  parseByteRange,
  pickFormat,
  toMediaWidth,
} from '@/lib/media';

export const runtime = 'nodejs';

/**
 * Sirve una imagen subida desde el panel.
 *
 * El id se genera al subir y nunca se reutiliza, asi que el contenido de una
 * URL no cambia jamas y puede cachearse de forma indefinida. Reemplazar la
 * imagen de un producto crea un id nuevo, y con el una URL nueva.
 *
 * Con `?w=` se pide una version mas estrecha, para no mandarle a un telefono
 * la foto de 2000 pixeles que solo hace falta en un monitor. Ademas, si el
 * navegador dice aceptar AVIF o WEBP, se le manda en ese formato: la misma
 * imagen, a la misma medida, pesando bastante menos.
 *
 * El original nunca se toca. Todo esto son copias guardadas aparte y, si algo
 * falla, se devuelve el archivo tal como se subio.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Un video se sirve por su cuenta: no tiene versiones por ancho ni formato,
  // y en cambio necesita responder a trozos. Se pregunta primero por el tipo y
  // el tamano, que son dos columnas cortas: traer los bytes aqui significaria
  // leer cada foto dos veces por peticion.
  let meta;
  try {
    meta = await getAssetMeta(id);
  } catch {
    return new NextResponse('Error', { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
  if (meta && isVideoType(meta.mimeType)) {
    return serveVideo(request, id, meta);
  }

  const width = toMediaWidth(new URL(request.url).searchParams.get('w'));
  const format = pickFormat(request.headers.get('accept'));

  // Un fallo pasajero (la base ocupada, una conexion que se agoto) no es
  // una imagen que no existe. Devolverlo como 404 hacia que un tropiezo de un
  // segundo se viera igual que una foto borrada: el navegador ya no reintenta
  // y la pagina queda con el hueco hasta que alguien la recarga. Un 500 dice
  // lo que pasa, y sin guardar en cache para que el siguiente intento vaya de
  // nuevo al servidor.
  let image;
  try {
    image = await getOptimizedImage(id, width, format);
  } catch {
    return new NextResponse('Error', { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!image) {
    return new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      'Content-Type': image.mimeType,
      'Content-Length': String(image.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
      // La respuesta cambia segun lo que el navegador acepte, asi que un cache
      // compartido no puede servirle AVIF a quien no lo entiende.
      Vary: 'Accept',
      // Evita que un SVG subido se interprete como documento en el dominio.
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

/**
 * Sirve un video, siempre por tramos acotados.
 *
 * Un `<video>` no se conforma con que le manden el archivo entero de una vez:
 * antes de reproducir pregunta por un trozo ("Range: bytes=0-") y espera que
 * el servidor conteste 206 con ese pedazo. Safari es el mas estricto —sin esto
 * directamente no reproduce— y los demas lo necesitan para poder saltar a un
 * punto o reiniciar el bucle sin volver a descargarlo todo.
 *
 * Lo importante es que el corte lo hace Postgres y que el tramo tiene tope. Un
 * video de fondo genera muchas peticiones: el principio, un salto al final a
 * buscar el indice, otra vez el principio, y de ahi en adelante por tramos. Si
 * cada una leyera la fila entera, un archivo de unos megas moveria cientos
 * entre la base y el servidor para reproducir unos segundos; lo que se ve
 * cuando eso pasa es que el video no carga.
 */
async function serveVideo(
  request: Request,
  id: string,
  meta: { mimeType: string; size: number },
): Promise<NextResponse> {
  const common = {
    'Content-Type': meta.mimeType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': 'inline',
    'X-Content-Type-Options': 'nosniff',
  };

  const range = parseByteRange(request.headers.get('range'), meta.size);

  // Un tramo que no existe se contesta como tal. Mandar el archivo entero
  // seria decirle al navegador que su peticion se cumplio, y el reproductor
  // se quedaria esperando bytes que nunca coinciden con lo que pidio.
  if (range === 'imposible') {
    return new NextResponse(null, {
      status: 416,
      headers: { ...common, 'Content-Range': `bytes */${meta.size}` },
    });
  }

  // Sin cabecera `Range` no hay reproductor detras, sino alguien abriendo la
  // direccion a pelo. Ahi se manda el archivo completo, que es lo que espera.
  const start = range ? range.start : 0;
  const end = range
    ? Math.min(range.end, start + VIDEO_CHUNK_BYTES - 1)
    : meta.size - 1;
  const length = end - start + 1;

  const chunk = await getAssetChunk(id, start, length).catch(() => null);
  if (!chunk) {
    return new NextResponse('Error', { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!range) {
    return new NextResponse(new Uint8Array(chunk), {
      headers: { ...common, 'Content-Length': String(chunk.length) },
    });
  }

  return new NextResponse(new Uint8Array(chunk), {
    status: 206,
    headers: {
      ...common,
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${start}-${start + chunk.length - 1}/${meta.size}`,
    },
  });
}

