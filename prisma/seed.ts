/**
 * Carga inicial de datos. Es idempotente: se puede ejecutar tantas veces como
 * haga falta (por ejemplo en cada deploy) sin duplicar registros.
 *
 *   npm run db:seed
 *
 * IMPORTANTE
 * Los productos se crean con lo minimo verificable: nombre, categoria y SKU.
 * Las descripciones largas, las caracteristicas, las especificaciones tecnicas
 * y los precios NO se inventan aqui: son datos del negocio que el propietario
 * debe cargar desde el panel con la informacion oficial del fabricante y su
 * propia lista de precios. El panel avisa que fichas estan incompletas.
 */
import { PrismaClient, type DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type ProductSeed = {
  slug: string;
  name: string;
  sku: string;
  collection: string;
};

const COLLECTIONS = [
  {
    slug: 'molinos',
    name: 'Molinos de cafe',
    description: 'Molinos electricos de sobremesa y portatiles.',
    image: null,
    position: 1,
    active: true,
  },
  {
    slug: 'maquinas-espresso',
    name: 'Maquinas de espresso portatiles',
    description: 'Espresso fuera de casa, con presion real.',
    image: null,
    position: 2,
    active: true,
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    description: 'Portafiltros, tampers, soportes y repuestos originales.',
    image: null,
    position: 3,
    active: true,
  },
];

/**
 * Catalogo oficial de STARSEEKER. Solo lo verificable: nombre, SKU y coleccion.
 * Los precios en pesos, las fotos, el stock y las fichas los carga el
 * propietario desde el panel. Se crean como borrador (`active: false`) y con
 * precio 0, asi que no aparecen en la tienda hasta que se publiquen.
 *
 * Solo se siembran con SEED_CATALOG=true.
 */
const PRODUCTS: ProductSeed[] = [
  // Molinos
  { slug: 'e55pro', name: 'STARSEEKER E55Pro Electric Coffee Grinder', sku: 'SS-E55PRO', collection: 'molinos' },
  { slug: 'e64', name: 'STARSEEKER E64 Electric Coffee Grinder 64MM', sku: 'SS-E64', collection: 'molinos' },
  { slug: 'edge', name: 'STARSEEKER EDGE Electric Coffee Grinder', sku: 'SS-EDGE', collection: 'molinos' },
  { slug: 'edgeplus', name: 'STARSEEKER EDGEPLUS Electric Coffee Grinder', sku: 'SS-EDGEPLUS', collection: 'molinos' },
  { slug: 'edge63', name: 'STARSEEKER EDGE63 Electric Coffee Grinder', sku: 'SS-EDGE63', collection: 'molinos' },
  { slug: 'edgemini', name: 'STARSEEKER EDGEMini Electric Portable Coffee Grinder', sku: 'SS-EDGEMINI', collection: 'molinos' },
  { slug: 'go50', name: 'STARSEEKER Go50 Electric Portable Coffee Grinder', sku: 'SS-GO50', collection: 'molinos' },
  { slug: '2-in-1-40mm', name: 'STARSEEKER 2-in-1 Black 40mm Burr Coffee Grinder', sku: 'SS-2IN1-40', collection: 'molinos' },
  // Maquinas portatiles
  { slug: 'super58', name: 'STARSEEKER Super58 Portable Espresso Machine', sku: 'SS-SUPER58', collection: 'maquinas-espresso' },
  { slug: 'supergobox', name: 'STARSEEKER SuperGoBox', sku: 'SS-SUPERGOBOX', collection: 'maquinas-espresso' },
  { slug: 'superminibox', name: 'STARSEEKER SuperMiniBox', sku: 'SS-SUPERMINIBOX', collection: 'maquinas-espresso' },
  { slug: 'cm-007', name: 'CM-007 Portable Espresso Maker 15Bar Self-Heating', sku: 'SS-CM007', collection: 'maquinas-espresso' },
  // Accesorios
  { slug: 'portafiltro-58mm', name: 'STARSEEKER 2 Ears 58mm Espresso Bottomless Portafilter', sku: 'SS-PF58', collection: 'accesorios' },
  { slug: 'tamper-calibrado', name: 'STARSEEKER Espresso Gravity Calibrated Tamper / Distributor', sku: 'SS-TAMPER', collection: 'accesorios' },
  { slug: 'wdt', name: 'STARSEEKER WDT Espresso Distribution Tool', sku: 'SS-WDT', collection: 'accesorios' },
  { slug: 'soporte-super58', name: 'Xuanwu Heavy-Duty Stand for Super58 Portable Espresso Maker', sku: 'SS-STAND58', collection: 'accesorios' },
];

const COUPONS: {
  code: string;
  type: DiscountType;
  value: number;
  minSubtotal: number;
  maxRedemtions: number | null;
}[] = [
  { code: 'BIENVENIDO10', type: 'PERCENT', value: 10, minSubtotal: 0, maxRedemtions: null },
  { code: 'ENVIOGRATIS', type: 'FIXED', value: 4990, minSubtotal: 30000, maxRedemtions: 500 },
];

async function seedCollections() {
  for (const collection of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      create: collection,
      update: collection,
    });
  }
  console.log(`  colecciones: ${COLLECTIONS.length}`);
}

async function seedProducts() {
  if (process.env.SEED_CATALOG !== 'true') {
    console.log('  productos: 0 (usa SEED_CATALOG=true para cargar el catalogo oficial)');
    return;
  }

  let created = 0;
  for (const [index, seed] of PRODUCTS.entries()) {
    const existing = await prisma.product.findUnique({ where: { slug: seed.slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        sku: seed.sku,
        subtitle: '',
        description: '',
        price: 0,
        stock: 0,
        weightGrams: 1000,
        lengthCm: 20,
        widthCm: 20,
        heightCm: 20,
        position: index,
        // Borrador: no se muestra en la tienda hasta que tenga precio y se publique.
        active: false,
      },
    });

    const collection = await prisma.collection.findUnique({ where: { slug: seed.collection } });
    if (collection) {
      await prisma.productCollection.create({
        data: { productId: product.id, collectionId: collection.id },
      });
    }
    created += 1;
  }
  console.log(`  productos: ${created} creados como borrador`);
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@starseeker.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const name = process.env.ADMIN_NAME ?? 'Administrador';

  const passwordHash = await bcrypt.hash(password, 12);

  // La contrasena solo se fija al crear: un re-seed no debe pisar la clave
  // que el administrador ya haya cambiado desde el panel.
  await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: 'ADMIN', emailVerified: true },
    update: { role: 'ADMIN', active: true },
  });
  console.log(`  administrador: ${email}`);
}

async function seedCoupons() {
  for (const coupon of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      create: coupon,
      update: { type: coupon.type, value: coupon.value, minSubtotal: coupon.minSubtotal },
    });
  }
  console.log(`  cupones: ${COUPONS.length}`);
}

async function seedSettings() {
  const settings: Record<string, string> = {
    'store.name': process.env.STORE_NAME ?? 'STARSEEKER Chile',
    'store.email': process.env.STORE_EMAIL ?? 'hola@starseerker.cl',
    'store.announcement': 'Despacho a todo Chile - Distribuidor oficial STARSEEKER',
    'store.marquee': [
      'Despacho a todo Chile',
      'Pago seguro con Mercado Pago',
      'Sigue tu pedido en linea',
      'Compra como invitado o con cuenta',
    ].join('\n'),
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }
  console.log(`  ajustes: ${Object.keys(settings).length}`);
}

async function main() {
  console.log('Sembrando datos iniciales...');
  await seedCollections();
  await seedProducts();
  await seedCoupons();
  await seedSettings();
  await seedAdmin();
  console.log('Listo.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
