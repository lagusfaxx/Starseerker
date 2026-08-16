/**
 * Feed de productos para Google Merchant Center.
 *
 * Merchant Center pide una direccion fija de la que descargar el catalogo una
 * vez al dia; esto arma ese archivo desde la misma base que pinta la tienda,
 * asi que no hay una segunda lista de productos que mantener al dia a mano.
 *
 * El formato es RSS 2.0 con el espacio de nombres `g:`, que es el que Google
 * documenta y el que acepta sin configuracion extra.
 *
 * La regla que manda sobre todas las demas: lo que va en el feed tiene que
 * coincidir con lo que ve el comprador al abrir el enlace. Un precio o una
 * disponibilidad que no calzan con la ficha son el motivo mas comun de que
 * Google rechace los productos, asi que cada campo de abajo se calcula igual
 * que lo calcula la pagina del producto.
 */
import type { Prisma } from '@prisma/client';
import { toNumber } from '@/lib/money';
import { absoluteUrl, resolveSeoDescription, truncate } from '@/lib/seo';

/** Google corta el titulo a 150 caracteres y la descripcion a 5000. */
const TITLE_LIMIT = 150;
const DESCRIPTION_LIMIT = 5000;

/** Y admite como mucho diez imagenes extra ademas de la principal. */
const EXTRA_IMAGE_LIMIT = 10;

/**
 * Producto tal como lo necesita el feed.
 *
 * Se declara aparte de la consulta para que la funcion que arma el XML sea
 * pura: recibe datos y devuelve texto, sin tocar la base ni la red.
 */
export type FeedProduct = {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string;
  seoDescription: string | null;
  price: Prisma.Decimal;
  compareAtPrice: Prisma.Decimal | null;
  sku: string;
  gtin: string | null;
  brand: string | null;
  stock: number;
  incoming: boolean;
  weightGrams: number;
  images: { url: string }[];
  variants: { stock: number }[];
  collections: { collection: { name: string } }[];
};

export type FeedOptions = {
  /** Direccion publica de la tienda, para armar enlaces absolutos. */
  siteUrl: string;
  /** Nombre de la tienda, es el titulo del canal del RSS. */
  storeName: string;
  /** Descripcion corta de la tienda para el mismo canal. */
  storeDescription: string;
  /** Marca general, la que se usa cuando el producto no trae la suya. */
  storeBrand: string | null;
  /** Moneda en la que estan los precios (`MP_CURRENCY`). */
  currency: string;
};

/**
 * Deja el texto en condiciones de entrar en un XML.
 *
 * Ademas de los cinco caracteres reservados hay que sacar los de control: una
 * descripcion pegada desde Word puede traerlos y bastan para que Google
 * descarte el archivo entero por malformado, no solo ese producto.
 */
export function escapeXml(value: string): string {
  return value
    // eslint-disable-next-line no-control-regex -- se limpian a proposito
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Unidades a la venta: las de las variantes si las hay, si no el stock base. */
function availableUnits(product: FeedProduct): number {
  return product.variants.length
    ? product.variants.reduce((total, variant) => total + variant.stock, 0)
    : product.stock;
}

/**
 * Estado de disponibilidad en el vocabulario de Google.
 *
 * `backorder` es el que corresponde a la reposicion en camino: la ficha ya
 * anuncia que llega pronto en vez de decir "agotado", y es lo que Google
 * entiende por un producto que se puede vender aunque hoy no haya unidades.
 */
export function feedAvailability(product: FeedProduct): string {
  if (availableUnits(product) > 0) return 'in_stock';
  return product.incoming ? 'backorder' : 'out_of_stock';
}

/**
 * El titulo lleva la marca cuando no viene ya en el nombre.
 *
 * Es el mismo criterio del titulo de la pagina: "E55Pro STARSEEKER" se busca,
 * "STARSEEKER STARSEEKER" no.
 */
export function feedTitle(product: FeedProduct, storeBrand: string | null): string {
  const brand = product.brand?.trim() || storeBrand?.trim() || '';
  const withBrand =
    brand && !product.name.toLowerCase().includes(brand.toLowerCase())
      ? `${product.name} ${brand}`
      : product.name;
  return truncate(withBrand, TITLE_LIMIT);
}

/**
 * Precio de lista y precio rebajado, en el formato "12345 CLP".
 *
 * Cuando hay descuento, Google espera el precio tachado en `price` y el que se
 * cobra hoy en `sale_price`, que es exactamente lo que muestra la ficha. Si el
 * "precio antes" es menor o igual al actual no es un descuento sino un dato
 * mal cargado, y publicarlo como tal haria que Google viera un precio mayor al
 * de la pagina.
 */
export function feedPrices(
  product: FeedProduct,
  currency: string,
): { price: string; salePrice: string | null } {
  const current = toNumber(product.price);
  const compare = product.compareAtPrice ? toNumber(product.compareAtPrice) : 0;
  const discounted = compare > current;

  return {
    price: `${discounted ? compare : current} ${currency}`,
    salePrice: discounted ? `${current} ${currency}` : null,
  };
}

/** Una etiqueta del feed, o nada si el valor esta vacio. */
function tag(name: string, value: string | null | undefined, indent = '    '): string {
  const clean = typeof value === 'string' ? value.trim() : '';
  return clean ? `${indent}<${name}>${escapeXml(clean)}</${name}>\n` : '';
}

/**
 * Un producto del catalogo como articulo del feed.
 *
 * Devuelve `null` para lo que Google rechazaria de todas formas: sin imagen o
 * sin precio el articulo no se puede publicar, y mandarlo solo sirve para
 * llenar la cuenta de errores y tapar los problemas que si importan.
 */
export function feedItem(product: FeedProduct, options: FeedOptions): string | null {
  const link = `${options.siteUrl.replace(/\/+$/, '')}/products/${product.slug}`;
  const images = product.images
    .map((image) => absoluteUrl(image.url, options.siteUrl))
    .filter((url): url is string => Boolean(url));

  if (!images.length) return null;
  if (toNumber(product.price) <= 0) return null;

  const brand = product.brand?.trim() || options.storeBrand?.trim() || '';
  const gtin = product.gtin?.trim() || '';
  const { price, salePrice } = feedPrices(product, options.currency);

  const description = truncate(
    resolveSeoDescription(
      { seoDescription: product.seoDescription },
      { name: product.name, tagline: product.subtitle, body: product.description },
    ) || product.name,
    DESCRIPTION_LIMIT,
  );

  let item = '  <item>\n';
  // El identificador tiene que ser estable entre descargas: si cambia, Google
  // da de baja el articulo anterior y publica uno nuevo, que vuelve a pasar
  // por revision. El SKU no cambia; el id de la base tampoco, pero el SKU es
  // el que el propietario reconoce en los informes de Merchant Center.
  item += tag('g:id', product.sku);
  item += tag('g:title', feedTitle(product, options.storeBrand));
  item += tag('g:description', description);
  item += tag('g:link', link);
  item += tag('g:image_link', images[0]);
  for (const extra of images.slice(1, EXTRA_IMAGE_LIMIT + 1)) {
    item += tag('g:additional_image_link', extra);
  }
  item += tag('g:availability', feedAvailability(product));
  item += tag('g:price', price);
  item += tag('g:sale_price', salePrice);
  // Todo lo que vende la tienda es nuevo; Google lo pide igual y sin el campo
  // asume "new", pero declararlo evita que la categoria quede a interpretacion.
  item += tag('g:condition', 'new');
  item += tag('g:brand', brand);
  item += tag('g:gtin', gtin);
  // El SKU sirve de referencia del fabricante. Junto con la marca cubre el
  // requisito de identificador cuando el producto todavia no tiene codigo de
  // barras cargado, que es el caso de casi todo catalogo recien montado.
  item += tag('g:mpn', product.sku);
  /*
   * `identifier_exists` es un "no" honesto, no un atajo.
   *
   * Solo va cuando de verdad no hay con que identificar el articulo: sin
   * codigo de barras y sin marca. Declararlo cuando si existen los datos hace
   * que Google deje de cruzar la oferta con las de otras tiendas, que es
   * justamente donde aparece el producto.
   */
  if (!gtin && !brand) item += tag('g:identifier_exists', 'no');
  for (const { collection } of product.collections.slice(0, 5)) {
    item += tag('g:product_type', collection.name);
  }
  // El peso del bulto es el que ya se usa para cotizar el envio, asi que el
  // costo que estime Google es el mismo que vera el comprador en el checkout.
  if (product.weightGrams > 0) item += tag('g:shipping_weight', `${product.weightGrams} g`);
  item += '  </item>\n';

  return item;
}

/** El catalogo completo como documento RSS listo para servir. */
export function buildMerchantFeed(products: FeedProduct[], options: FeedOptions): string {
  const items = products
    .map((product) => feedItem(product, options))
    .filter((item): item is string => item !== null)
    .join('');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    '<channel>\n' +
    tag('title', options.storeName, '  ') +
    tag('link', options.siteUrl, '  ') +
    tag('description', options.storeDescription, '  ') +
    items +
    '</channel>\n' +
    '</rss>\n'
  );
}

/** Campos que la consulta tiene que traer para armar el feed. */
export const feedProductSelect = {
  slug: true,
  name: true,
  subtitle: true,
  description: true,
  seoDescription: true,
  price: true,
  compareAtPrice: true,
  sku: true,
  gtin: true,
  brand: true,
  stock: true,
  incoming: true,
  weightGrams: true,
  images: { select: { url: true }, orderBy: { position: 'asc' } },
  variants: { where: { active: true }, select: { stock: true } },
  collections: { select: { collection: { select: { name: true } } } },
} satisfies Prisma.ProductSelect;
