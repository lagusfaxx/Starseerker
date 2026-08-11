import { prisma } from "@/lib/prisma";

export type StoreSettings = {
  storeName: string;
  /** URL o ruta del logo (ej. "/logo.svg"). Vacío = se usa el logotipo tipográfico. */
  logoUrl: string;
  /** Alto del logo en píxeles dentro de la cabecera. */
  logoHeight: number;
  tagline: string;
  supportEmail: string;
  salesEmail: string;
  whatsapp: string;
  phone: string;
  address: string;
  instagram: string;
  freeShippingThreshold: number | null;
  /** Valores iniciales del bloque de portada; después se editan en Panel → Portada. */
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  announcement: string;
  announcementActive: boolean;
  /** Los pedidos bajo este monto no pueden pagarse (evita fraude de montos ínfimos). */
  minOrderTotal: number;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "STARSEEKER Chile",
  logoUrl: "",
  logoHeight: 28,
  tagline: "Distribuidor oficial STARSEEKER en Chile",
  supportEmail: "soporte@starseerker.cl",
  salesEmail: "ventas@starseerker.cl",
  whatsapp: "+56900000000",
  phone: "+56 2 2000 0000",
  address: "Santiago, Chile",
  instagram: "https://instagram.com/starseeker.cl",
  freeShippingThreshold: 150000,
  heroVideoUrl: "",
  heroPosterUrl: "/hero-poster.jpg",
  heroTitle: "Convierte el café de especialidad en algo diario",
  heroSubtitle: "Molinos eléctricos y máquinas de espresso portátiles",
  heroCtaLabel: "",
  heroCtaHref: "/productos",
  announcement: "Despacho gratis sobre $150.000 · Distribuidor oficial en Chile",
  announcementActive: true,
  minOrderTotal: 1000,
};

const SETTINGS_KEY = "store";

export async function getSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(row.value as Partial<StoreSettings>) };
  } catch {
    // Sin base de datos disponible (build estático, primer arranque) usamos los valores por defecto.
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: next },
    update: { value: next },
  });
  return next;
}
