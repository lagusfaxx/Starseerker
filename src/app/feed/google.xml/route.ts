/**
 * `/feed/google.xml` — el archivo que descarga Google Merchant Center.
 *
 * Esta es la direccion que se pega en Merchant Center al elegir "Anadir
 * productos desde un archivo". Se configura una sola vez y desde ahi Google
 * vuelve cada 24 horas a leerla, asi que un producto que se edita en el panel
 * llega a Google sin que nadie suba nada a mano.
 *
 * Va colgando de `/feed` y no de `/api` a proposito: el `robots.txt` cierra
 * `/api` entero, y un archivo que el rastreador tiene prohibido leer no sirve
 * de feed.
 */
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { buildMerchantFeed, feedProductSelect } from '@/lib/merchant-feed';
import { getStoreSettings } from '@/lib/store-settings';

// El catalogo cambia con cada edicion del panel; servir una copia congelada en
// el build significaria mandar a Google precios y stock del dia del despliegue.
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const [products, store] = await Promise.all([
    prisma.product.findMany({
      /*
       * Lo mismo que entra al sitemap: solo lo que esta a la venta y no se
       * marco como oculto. Ofrecerle a Google un producto que la tienda pide
       * no indexar seria contradictorio, y anunciar uno desactivado lleva al
       * comprador a una ficha que no existe, que es motivo de suspension de la
       * cuenta de Merchant Center.
       */
      where: { active: true, noIndex: false },
      orderBy: { position: 'asc' },
      select: feedProductSelect,
    }),
    getStoreSettings(),
  ]);

  const xml = buildMerchantFeed(products, {
    siteUrl: env.appUrl,
    storeName: store.name,
    storeDescription: store.metaDescription,
    storeBrand: store.brand,
    currency: env.currency,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Google lee esto una vez al dia; una hora de cache absorbe los reintentos
      // y las revisiones manuales sin recorrer el catalogo entero cada vez.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
