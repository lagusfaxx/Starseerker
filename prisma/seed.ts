/**
 * Datos iniciales.
 *
 * Siempre crea lo estructural: usuario del panel, categorías, zonas de despacho
 * para las 16 regiones y un cupón de bienvenida.
 *
 * NO crea productos. El catálogo lo cargas tú desde el panel con tus precios,
 * fotos y stock reales. Si quieres partir con el esqueleto del catálogo oficial
 * de STARSEEKER (nombres, SKU y categoría, sin precio y sin publicar), ejecuta:
 *
 *   SEED_CATALOG=true npm run db:seed
 *
 * Los productos quedan como borrador (`active: false`) y con precio 0: no
 * aparecen en la tienda hasta que les pongas precio y los publiques.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL no está configurado.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Las mismas categorías que usa la marca: molinos, máquinas portátiles y accesorios. */
const CATEGORIES = [
  {
    slug: "molinos",
    name: "Molinos de café",
    description: "Molinos eléctricos de sobremesa y portátiles.",
    position: 1,
  },
  {
    slug: "maquinas-espresso",
    name: "Máquinas de espresso portátiles",
    description: "Espresso fuera de casa, con presión real.",
    position: 2,
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    description: "Portafiltros, tampers, soportes y repuestos originales.",
    position: 3,
  },
];

/**
 * Esqueleto del catálogo oficial de STARSEEKER (starseekercoffee.com).
 * Solo nombre, SKU y categoría: los precios en pesos, las fotos, el stock y las
 * fichas técnicas los cargas tú. Sin `SEED_CATALOG=true` no se crea ninguno.
 */
const CATALOG: { name: string; sku: string; category: string }[] = [
  // Molinos
  { name: "STARSEEKER E55Pro Electric Coffee Grinder", sku: "SS-E55PRO", category: "molinos" },
  { name: "STARSEEKER E64 Electric Coffee Grinder 64MM", sku: "SS-E64", category: "molinos" },
  { name: "STARSEEKER EDGE Electric Coffee Grinder", sku: "SS-EDGE", category: "molinos" },
  { name: "STARSEEKER EDGEPLUS Electric Coffee Grinder", sku: "SS-EDGEPLUS", category: "molinos" },
  { name: "STARSEEKER EDGE63 Electric Coffee Grinder", sku: "SS-EDGE63", category: "molinos" },
  {
    name: "STARSEEKER EDGEMini Electric Portable Coffee Grinder",
    sku: "SS-EDGEMINI",
    category: "molinos",
  },
  {
    name: "STARSEEKER Go50 Electric Portable Coffee Grinder",
    sku: "SS-GO50",
    category: "molinos",
  },
  {
    name: "STARSEEKER 2-in-1 Black 40mm Burr Coffee Grinder",
    sku: "SS-2IN1-40",
    category: "molinos",
  },
  // Máquinas portátiles
  {
    name: "STARSEEKER Super58 Portable Espresso Machine",
    sku: "SS-SUPER58",
    category: "maquinas-espresso",
  },
  { name: "STARSEEKER SuperGoBox", sku: "SS-SUPERGOBOX", category: "maquinas-espresso" },
  { name: "STARSEEKER SuperMiniBox", sku: "SS-SUPERMINIBOX", category: "maquinas-espresso" },
  {
    name: "CM-007 Portable Espresso Maker 15Bar Self-Heating",
    sku: "SS-CM007",
    category: "maquinas-espresso",
  },
  // Accesorios
  {
    name: "STARSEEKER 2 Ears 58mm Espresso Bottomless Portafilter",
    sku: "SS-PF58",
    category: "accesorios",
  },
  {
    name: "STARSEEKER Espresso Gravity Calibrated Tamper / Distributor",
    sku: "SS-TAMPER",
    category: "accesorios",
  },
  { name: "STARSEEKER WDT Espresso Distribution Tool", sku: "SS-WDT", category: "accesorios" },
  {
    name: "Xuanwu Heavy-Duty Stand for Super58 Portable Espresso Maker",
    sku: "SS-STAND58",
    category: "accesorios",
  },
];

const ZONES = [
  {
    name: "Región Metropolitana",
    regionCodes: ["RM"],
    position: 1,
    rates: [
      {
        name: "Retiro en tienda",
        description: "Te avisamos por correo cuando el pedido esté listo.",
        price: 0,
        etaMinDays: 1,
        etaMaxDays: 2,
        isPickup: true,
        position: 0,
      },
      {
        name: "Despacho estándar",
        description: "Entrega en domicilio",
        price: 4990,
        freeOver: 150000,
        etaMinDays: 1,
        etaMaxDays: 2,
        position: 1,
      },
      {
        name: "Despacho express",
        description: "Entrega el día hábil siguiente",
        price: 8990,
        etaMinDays: 1,
        etaMaxDays: 1,
        position: 2,
      },
    ],
  },
  {
    name: "Zona centro",
    regionCodes: ["V", "VI", "VII", "XVI"],
    position: 2,
    rates: [
      {
        name: "Despacho estándar",
        description: "Entrega en domicilio",
        price: 6990,
        freeOver: 150000,
        etaMinDays: 2,
        etaMaxDays: 4,
        position: 1,
      },
    ],
  },
  {
    name: "Zona norte",
    regionCodes: ["XV", "I", "II", "III", "IV"],
    position: 3,
    rates: [
      {
        name: "Despacho estándar",
        description: "Entrega en domicilio",
        price: 8990,
        freeOver: 200000,
        etaMinDays: 3,
        etaMaxDays: 6,
        position: 1,
      },
    ],
  },
  {
    name: "Zona sur",
    regionCodes: ["VIII", "IX", "XIV", "X"],
    position: 4,
    rates: [
      {
        name: "Despacho estándar",
        description: "Entrega en domicilio",
        price: 8990,
        freeOver: 200000,
        etaMinDays: 3,
        etaMaxDays: 6,
        position: 1,
      },
    ],
  },
  {
    name: "Zonas extremas",
    regionCodes: ["XI", "XII"],
    position: 5,
    rates: [
      {
        name: "Despacho a zona extrema",
        description: "Plazos sujetos a la conectividad del courier",
        price: 14990,
        etaMinDays: 5,
        etaMaxDays: 12,
        position: 1,
      },
    ],
  },
];

async function main() {
  // --- Usuario del panel ---
  const email = (process.env.ADMIN_EMAIL ?? "admin@starseerker.cl").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "cambia-esta-clave";
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "Administrador",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`✓ Usuario del panel: ${email}`);

  // --- Categorías ---
  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryIds.set(category.slug, saved.id);
  }
  console.log(`✓ ${CATEGORIES.length} categorías`);

  // --- Zonas y tarifas de despacho ---
  for (const zone of ZONES) {
    const { rates, ...zoneData } = zone;
    const existing = await prisma.shippingZone.findFirst({ where: { name: zone.name } });
    const saved = existing
      ? await prisma.shippingZone.update({ where: { id: existing.id }, data: zoneData })
      : await prisma.shippingZone.create({ data: zoneData });

    for (const rate of rates) {
      const existingRate = await prisma.shippingRate.findFirst({
        where: { zoneId: saved.id, name: rate.name },
      });
      if (existingRate) {
        await prisma.shippingRate.update({ where: { id: existingRate.id }, data: rate });
      } else {
        await prisma.shippingRate.create({ data: { ...rate, zoneId: saved.id } });
      }
    }
  }
  console.log(`✓ ${ZONES.length} zonas de despacho cubriendo las 16 regiones`);

  // --- Cupón de bienvenida ---
  await prisma.coupon.upsert({
    where: { code: "BIENVENIDA10" },
    update: {},
    create: { code: "BIENVENIDA10", type: "PERCENT", value: 10, minSubtotal: 50000 },
  });
  console.log("✓ Cupón BIENVENIDA10 (10% sobre $50.000)");

  // --- Catálogo (opcional, como borrador) ---
  if (process.env.SEED_CATALOG === "true") {
    let created = 0;
    for (const [index, item] of CATALOG.entries()) {
      const slug = item.sku.toLowerCase();
      const existing = await prisma.product.findUnique({ where: { sku: item.sku } });
      if (existing) continue;
      await prisma.product.create({
        data: {
          slug,
          name: item.name,
          sku: item.sku,
          price: 0,
          stock: 0,
          active: false, // borrador: no aparece en la tienda
          position: index,
          categoryId: categoryIds.get(item.category),
        },
      });
      created++;
    }
    console.log(
      `✓ ${created} productos creados como borrador. Ponles precio, fotos y stock en el panel y publícalos.`,
    );
  } else {
    console.log(
      "· Sin productos: cárgalos desde el panel. Para partir con el esqueleto del catálogo oficial usa SEED_CATALOG=true.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
