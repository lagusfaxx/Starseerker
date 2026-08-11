import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { HELP_PAGES, LEGAL_PAGES } from "@/lib/content";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://starseerker.cl").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/productos`, priority: 0.9 },
    { url: `${base}/ayuda`, priority: 0.5 },
    { url: `${base}/nosotros`, priority: 0.4 },
    { url: `${base}/contacto`, priority: 0.4 },
    ...HELP_PAGES.map((page) => ({ url: `${base}/ayuda/${page.slug}`, priority: 0.3 })),
    ...LEGAL_PAGES.map((page) => ({ url: `${base}/legal/${page.slug}`, priority: 0.2 })),
  ];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ where: { active: true }, select: { slug: true } }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((c) => ({ url: `${base}/coleccion/${c.slug}`, priority: 0.7 })),
      ...products.map((p) => ({
        url: `${base}/producto/${p.slug}`,
        lastModified: p.updatedAt,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
