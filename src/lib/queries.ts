import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ProductCardData } from "@/components/product-card";

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  price: true,
  compareAtPrice: true,
  sku: true,
  stock: true,
  isNew: true,
  bestSeller: true,
  images: { orderBy: { position: "asc" as const }, take: 1, select: { url: true, alt: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export function toCard(product: CardRow): ProductCardData {
  const { images, ...rest } = product;
  return { ...rest, image: images[0]?.url ?? null, imageAlt: images[0]?.alt ?? null };
}

export type ProductFilter = "nuevos" | "mas-vendidos" | "ofertas" | "destacados" | null;

export type ProductQuery = {
  filter?: ProductFilter;
  categorySlug?: string;
  search?: string;
  sort?: "recomendados" | "precio-asc" | "precio-desc" | "nuevos";
  onlyInStock?: boolean;
  take?: number;
  skip?: number;
};

export function buildWhere(query: ProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };

  if (query.categorySlug) where.category = { slug: query.categorySlug };
  if (query.onlyInStock) where.stock = { gt: 0 };

  switch (query.filter) {
    case "nuevos":
      where.isNew = true;
      break;
    case "mas-vendidos":
      where.bestSeller = true;
      break;
    case "destacados":
      where.featured = true;
      break;
    case "ofertas":
      where.compareAtPrice = { not: null };
      break;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { subtitle: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function orderBy(sort: ProductQuery["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "precio-asc":
      return [{ price: "asc" }];
    case "precio-desc":
      return [{ price: "desc" }];
    case "nuevos":
      return [{ createdAt: "desc" }];
    default:
      return [{ position: "asc" }, { featured: "desc" }, { createdAt: "desc" }];
  }
}

export async function listProducts(query: ProductQuery = {}) {
  const where = buildWhere(query);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy: orderBy(query.sort),
      take: query.take ?? 24,
      skip: query.skip ?? 0,
    }),
    prisma.product.count({ where }),
  ]);
  return { products: rows.map(toCard), total };
}

/** Nunca hace fallar el render si la base de datos aún no está poblada. */
export async function safeListProducts(query: ProductQuery = {}) {
  try {
    return await listProducts(query);
  } catch (error) {
    console.error("[queries] listProducts falló:", error);
    return { products: [] as ProductCardData[], total: 0 };
  }
}

export async function safeListCategories() {
  try {
    return await prisma.category.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
    },
  });
}
