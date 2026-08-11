import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { storeImage, storeVideo } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Recibe una imagen del panel y devuelve la URL con la que referenciarla. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Peticion invalida.' }, { status: 400 });
  }

  const file = formData.get('file');
  const alt = String(formData.get('alt') ?? '');

  // El panel dice que esta subiendo. Lo que decide de verdad es el tipo del
  // archivo, que se comprueba dentro; esto solo elige contra que lista se
  // valida, para que subir un JPG al campo de video de un error que se
  // entienda en vez de aceptarlo.
  const kind = String(formData.get('kind') ?? 'image');

  const result =
    kind === 'video' ? await storeVideo(file as File) : await storeImage(file as File, alt);
  if ('error' in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
