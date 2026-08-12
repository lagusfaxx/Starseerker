import { SEO_DESCRIPTION_LIMIT, SEO_TITLE_LIMIT, truncate } from './seo';

/**
 * SEO de la portada.
 *
 * La portada es la pagina por la que se busca el nombre de la marca, y era la
 * unica sin texto propio: solo el carrusel, las tarjetas del catalogo y los
 * pies de las secciones. Para un buscador eso es una pagina casi muda, por muy
 * bien escritas que esten las fichas de los productos.
 *
 * Aqui se arma lo que ve Google. Si el propietario escribio su titulo o su
 * texto, mandan los suyos. Si no, se construyen con lo que la tienda ya sabe
 * de si misma: su nombre y los productos que vende, que son justamente las
 * palabras por las que la buscan.
 */

export type HomeSeoInput = {
  storeName: string;
  /** Marca de los productos, cuando no es la de la tienda. */
  brand: string | null;
  seoTitle: string | null;
  seoHeading: string | null;
  seoText: string | null;
  metaDescription: string | null;
  /** Nombres de producto, en el orden en que se quieren nombrar. */
  productNames: string[];
  /** Nombres de las colecciones activas. */
  collectionNames: string[];
};

export type HomeSeo = {
  title: string;
  description: string;
  heading: string;
  text: string;
};

/**
 * Quita de un nombre de producto la marca o el nombre de la tienda.
 *
 * Los catalogos suelen repetir la marca en cada modelo ("Starseeker S58",
 * "Starseeker S58 Pro"), lo cual esta bien en la ficha pero no en una frase que
 * ya empieza por la marca: el titular terminaba siendo "STARSEEKER: S58 PRO,
 * STARSEEKER S58 PRO, STARSEEKER S58", con la palabra tres veces y ocupando
 * cuatro lineas en un telefono.
 *
 * Si al quitarla no queda nada —un producto que se llama igual que la marca—
 * se devuelve el nombre entero, que es mejor que una entrada vacia.
 */
function sinMarca(nombre: string, marcas: string[]): string {
  let limpio = nombre.trim();

  for (const marca of marcas) {
    if (!marca) continue;
    const escapada = marca.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    limpio = limpio.replace(new RegExp(`\\b${escapada}\\b`, 'gi'), ' ');
  }

  limpio = limpio.replace(/\s+/g, ' ').replace(/^[\s:,-]+|[\s:,-]+$/g, '');
  return limpio || nombre.trim();
}

/**
 * Deja una sola version de cada nombre.
 *
 * Despues de quitar la marca quedan repetidos ("Starseeker S58" y "S58" son la
 * misma palabra), y una lista que dice dos veces lo mismo se lee como un error.
 * La comparacion ignora mayusculas, espacios y signos.
 */
function unicos(nombres: string[]): string[] {
  const vistos = new Set<string>();

  return nombres.filter((nombre) => {
    const clave = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clave || vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

/** Une una lista en castellano: "a, b y c". */
function listar(items: string[]): string {
  const limpio = items.map((item) => item.trim()).filter(Boolean);
  if (limpio.length === 0) return '';
  if (limpio.length === 1) return limpio[0]!;
  return `${limpio.slice(0, -1).join(', ')} y ${limpio[limpio.length - 1]}`;
}

export function buildHomeSeo(input: HomeSeoInput): HomeSeo {
  const marca = input.brand?.trim() || null;

  // Se quitan la marca y el nombre de la tienda de cada modelo antes de
  // nombrarlos, porque la frase ya empieza por ahi.
  const productos = unicos(
    input.productNames
      .filter(Boolean)
      .map((nombre) => sinMarca(nombre, [marca ?? '', input.storeName])),
  ).slice(0, 5);
  const colecciones = input.collectionNames.filter(Boolean).slice(0, 3);

  // Con marca declarada manda ella, porque es la palabra que se busca: quien
  // no conoce la tienda busca la marca, no el nombre del negocio.
  const quien = marca ? `${marca} Chile` : input.storeName;

  // El titulo nombra la tienda y despues los productos, que es el orden en que
  // se busca: primero la marca, y quien ya sabe que quiere busca el modelo.
  const titulo =
    input.seoTitle?.trim() ||
    (productos.length > 0
      ? `${quien} | ${listar(productos.slice(0, 3))}`
      : `${quien} | Molinos y maquinas de espresso`);

  const descripcion =
    input.metaDescription?.trim() ||
    (productos.length > 0
      ? `${quien}: ${listar(productos)} y mas equipos de cafe${
          marca ? ` de ${marca}` : ''
        }. Despacho a todo Chile y pago seguro.`
      : `${quien}. Compra en linea con despacho a todo Chile y pago seguro.`);

  const encabezado =
    input.seoHeading?.trim() ||
    (productos.length > 0
      ? `${quien}: ${productos.slice(0, 3).join(', ')}`
      : `${quien}, equipos de cafe`);

  const texto =
    input.seoText?.trim() ||
    [
      productos.length > 0
        ? `En ${input.storeName} encuentras ${listar(productos)}${
            marca ? ` de ${marca}` : ''
          }: molinos electricos y maquinas de espresso portatiles para preparar cafe donde estes.`
        : `En ${input.storeName} encuentras molinos electricos y maquinas de espresso portatiles, con despacho a todo el pais.`,
      colecciones.length > 0
        ? `Tenemos ${listar(colecciones)}, con despacho a todo Chile y pago seguro con Mercado Pago.`
        : 'Despacho a todo Chile y pago seguro con Mercado Pago.',
    ].join(' ');

  return {
    title: truncate(titulo, SEO_TITLE_LIMIT),
    description: truncate(descripcion, SEO_DESCRIPTION_LIMIT),
    heading: encabezado,
    text: texto,
  };
}
