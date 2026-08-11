/**
 * Datos iniciales: usuario admin, categorías, productos de ejemplo,
 * zonas de despacho para las 16 regiones y un cupón de bienvenida.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL no está configurado.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CATEGORIES = [
  {
    slug: "molinos",
    name: "Molinos",
    description: "Molinos eléctricos y manuales con fresas cónicas de acero.",
    position: 1,
  },
  {
    slug: "maquinas-espresso",
    name: "Máquinas de espresso",
    description: "Espresso portátil con presión ajustable para viajar o para la oficina.",
    position: 2,
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    description: "Estuches, tampers, filtros y repuestos originales.",
    position: 3,
  },
];

const PRODUCTS = [
  {
    slug: "starseeker-e55pro-molino-electrico",
    name: "STARSEEKER E55Pro Molino Eléctrico",
    subtitle: "Fresas cónicas de 55 mm",
    sku: "SS-E55PRO",
    price: 289000,
    compareAtPrice: null,
    stock: 12,
    category: "molinos",
    featured: true,
    isNew: true,
    bestSeller: true,
    highlights: [
      "Fresas cónicas de acero endurecido de 55 mm",
      "Micro-ajuste continuo: de espresso a prensa francesa",
      "Motor DC de bajo torque que no calienta el café",
      "Retención mínima gracias al conducto antiestático",
    ],
    specs: [
      { label: "Fresas", value: "Cónicas de acero SUS440, 55 mm" },
      { label: "Ajustes de molienda", value: "Continuo, 90 clics por vuelta" },
      { label: "Motor", value: "DC 200 W, 1400 rpm" },
      { label: "Capacidad de tolva", value: "40 g" },
      { label: "Dimensiones", value: "310 × 120 × 180 mm" },
      { label: "Peso", value: "3,2 kg" },
    ],
    description:
      "El E55Pro es el molino de sobremesa de STARSEEKER para quienes muelen a diario y no quieren transar en consistencia. Sus fresas cónicas de 55 mm entregan una distribución de partículas pareja tanto en espresso como en métodos de filtrado.\n\nEl micro-ajuste continuo permite mover el punto de molienda en pasos muy finos, y el conducto antiestático reduce la retención a menos de 0,3 g entre dosis.",
  },
  {
    slug: "starseeker-super58-espresso-portatil",
    name: "STARSEEKER Super58 Máquina de Espresso Portátil",
    subtitle: "18-20 g · presión ajustable · USB-C",
    sku: "SS-SUPER58",
    price: 249000,
    compareAtPrice: 299000,
    stock: 8,
    category: "maquinas-espresso",
    featured: true,
    isNew: true,
    bestSeller: true,
    highlights: [
      "Canasta de 18 a 20 g, tamaño de cafetería",
      "Presión ajustable con manómetro integrado",
      "Carga USB-C: funciona en el auto, camping u oficina",
      "Incluye soporte plegable y bolso de transporte",
    ],
    specs: [
      { label: "Canasta", value: "58 mm, 18-20 g" },
      { label: "Presión", value: "Ajustable, 6-12 bar con manómetro" },
      { label: "Batería", value: "3000 mAh, ~12 shots por carga" },
      { label: "Carga", value: "USB-C PD" },
      { label: "Peso", value: "1,1 kg" },
      { label: "Incluye", value: "Soporte plegable, bolso, tamper" },
    ],
    description:
      "Espresso de verdad donde estés. La Super58 usa una canasta de 58 mm igual a la de una máquina de cafetería, así que puedes replicar tus recetas sin recalcular dosis.\n\nEl manómetro integrado te muestra la presión en tiempo real y la palanca permite ajustarla durante la extracción, algo que ninguna portátil de esta gama ofrece.",
  },
  {
    slug: "starseeker-go50-molino-portatil",
    name: "STARSEEKER Go50 Molino Eléctrico Portátil",
    subtitle: "Molino de viaje con batería",
    sku: "SS-GO50",
    price: 299000,
    compareAtPrice: null,
    stock: 10,
    category: "molinos",
    featured: true,
    isNew: true,
    bestSeller: false,
    highlights: [
      "Muele 20 g en menos de 20 segundos",
      "Batería para más de 40 dosis por carga",
      "Base magnética y cuerpo de aluminio",
      "Compatible con portafiltros de 51 y 58 mm",
    ],
    specs: [
      { label: "Fresas", value: "Cónicas de acero, 38 mm" },
      { label: "Batería", value: "2600 mAh" },
      { label: "Autonomía", value: "~40 dosis de 18 g" },
      { label: "Peso", value: "640 g" },
      { label: "Carga", value: "USB-C" },
    ],
    description:
      "El Go50 es el molino que llevas en la mochila. Cuerpo de aluminio anodizado, fresas cónicas de 38 mm y una batería que aguanta un fin de semana completo de camping sin buscar enchufe.",
  },
  {
    slug: "starseeker-supergobox",
    name: "STARSEEKER SuperGoBox",
    subtitle: "Estuche completo de viaje",
    sku: "SS-GOBOX",
    price: 568000,
    compareAtPrice: 599000,
    stock: 5,
    category: "accesorios",
    featured: true,
    isNew: false,
    bestSeller: true,
    highlights: [
      "Maletín rígido con espuma troquelada",
      "Espacio para molino, máquina, tazas y accesorios",
      "Cierres con seguro y asa reforzada",
    ],
    specs: [
      { label: "Material", value: "ABS reforzado con marco de aluminio" },
      { label: "Interior", value: "Espuma EVA troquelada" },
      { label: "Dimensiones", value: "450 × 330 × 150 mm" },
      { label: "Peso", value: "2,8 kg vacío" },
    ],
    description:
      "El maletín que ordena todo tu setup portátil: espuma troquelada para cada pieza, marco de aluminio y cierres con seguro. Pensado para que la máquina y el molino viajen sin golpes.",
  },
];

const ZONES = [
  {
    name: "Región Metropolitana",
    regionCodes: ["RM"],
    position: 1,
    rates: [
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
      {
        name: "Retiro en tienda",
        description: "Providencia, Santiago. Te avisamos cuando esté listo.",
        price: 0,
        etaMinDays: 1,
        etaMaxDays: 2,
        isPickup: true,
        position: 0,
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
        description: "Plazos sujetos a conectividad del courier",
        price: 14990,
        etaMinDays: 5,
        etaMaxDays: 12,
        position: 1,
      },
    ],
  },
];

async function main() {
  // --- Admin ---
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
  console.log(`✓ Usuario admin: ${email}`);

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

  // --- Productos ---
  for (const product of PRODUCTS) {
    const { category, ...rest } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...rest, categoryId: categoryIds.get(category) },
      create: { ...rest, categoryId: categoryIds.get(category) },
    });
  }
  console.log(`✓ ${PRODUCTS.length} productos de ejemplo (sin imágenes: cárgalas desde el panel)`);

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
