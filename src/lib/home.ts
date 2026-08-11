import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

/**
 * La portada se arma con bloques ordenables que se editan desde
 * Panel → Portada. Todo el texto, las imágenes y los videos son editables.
 */
export type BlockType = "hero" | "products" | "categories" | "gallery" | "mediaText" | "banner";

type Base = { id: string; type: BlockType; active: boolean };

/** Video o imagen a pantalla completa, con una frase encima y una franja debajo. */
export type HeroBlock = Base & {
  type: "hero";
  /** URL de imagen o de video (.mp4, .webm…). */
  mediaUrl: string;
  /** Imagen de respaldo mientras carga el video. */
  posterUrl: string;
  overlayText: string;
  bandText: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Carrusel o grilla de productos según un filtro. */
export type ProductsBlock = Base & {
  type: "products";
  title: string;
  /** "nuevos" | "mas-vendidos" | "ofertas" | "destacados" | "" (todos) */
  filter: string;
  /** Slug de categoría para acotar, opcional. */
  categorySlug: string;
  limit: number;
  layout: "grid" | "carousel";
  linkLabel: string;
  linkHref: string;
};

/** Grilla de categorías con la imagen de cada una. */
export type CategoriesBlock = Base & {
  type: "categories";
  title: string;
  linkLabel: string;
  linkHref: string;
};

/** Carrusel o grilla de imágenes o videos sueltos. */
export type GalleryBlock = Base & {
  type: "gallery";
  title: string;
  /** URLs de imagen o video, una por línea en el panel. */
  items: string[];
  layout: "grid" | "carousel";
};

/** Media a un lado y texto al otro, con el orden invertible. */
export type MediaTextBlock = Base & {
  type: "mediaText";
  mediaUrl: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** true = el texto va a la izquierda y la media a la derecha. */
  reversed: boolean;
};

/** Franja de texto centrada. */
export type BannerBlock = Base & {
  type: "banner";
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomeBlock =
  | HeroBlock
  | ProductsBlock
  | CategoriesBlock
  | GalleryBlock
  | MediaTextBlock
  | BannerBlock;

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Portada (video o imagen)",
  products: "Productos",
  categories: "Categorías",
  gallery: "Galería de imágenes",
  mediaText: "Imagen/video + texto",
  banner: "Franja de texto",
};

const HOME_KEY = "home";

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyBlock(type: BlockType): HomeBlock {
  const base = { id: newId(), active: true };
  switch (type) {
    case "hero":
      return {
        ...base,
        type,
        mediaUrl: "",
        posterUrl: "",
        overlayText: "",
        bandText: "",
        ctaLabel: "",
        ctaHref: "/productos",
      };
    case "products":
      return {
        ...base,
        type,
        title: "Novedades",
        filter: "nuevos",
        categorySlug: "",
        limit: 4,
        layout: "grid",
        linkLabel: "Ver todos",
        linkHref: "/productos",
      };
    case "categories":
      return { ...base, type, title: "Categorías", linkLabel: "Ver el catálogo", linkHref: "/productos" };
    case "gallery":
      return { ...base, type, title: "Galería", items: [], layout: "grid" };
    case "mediaText":
      return {
        ...base,
        type,
        mediaUrl: "",
        eyebrow: "",
        title: "",
        body: "",
        ctaLabel: "",
        ctaHref: "",
        reversed: false,
      };
    case "banner":
      return { ...base, type, title: "", body: "", ctaLabel: "", ctaHref: "" };
  }
}

/** Portada por defecto: se usa mientras nadie haya guardado una configuración. */
async function defaultBlocks(): Promise<HomeBlock[]> {
  const settings = await getSettings();
  return [
    {
      ...emptyBlock("hero"),
      type: "hero",
      mediaUrl: settings.heroVideoUrl,
      posterUrl: settings.heroPosterUrl,
      overlayText: settings.heroTitle,
      bandText: settings.heroSubtitle,
      ctaLabel: settings.heroCtaLabel,
      ctaHref: settings.heroCtaHref,
    } as HeroBlock,
    { ...emptyBlock("products"), type: "products", title: "Novedades", filter: "nuevos" } as ProductsBlock,
    {
      ...emptyBlock("products"),
      type: "products",
      title: "Más vendidos",
      filter: "mas-vendidos",
      linkHref: "/productos?filtro=mas-vendidos",
    } as ProductsBlock,
    { ...emptyBlock("categories"), type: "categories" } as CategoriesBlock,
  ];
}

export async function getHomeBlocks(): Promise<HomeBlock[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: HOME_KEY } });
    const value = row?.value as { blocks?: HomeBlock[] } | undefined;
    if (value?.blocks && Array.isArray(value.blocks) && value.blocks.length > 0) {
      return value.blocks;
    }
  } catch {
    // Sin base de datos se usa la portada por defecto.
  }
  return defaultBlocks();
}

export async function saveHomeBlocks(blocks: HomeBlock[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: HOME_KEY },
    create: { key: HOME_KEY, value: { blocks } },
    update: { value: { blocks } },
  });
}
