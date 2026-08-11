import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { HELP_PAGES, LEGAL_PAGES } from "@/lib/content";

export const runtime = "nodejs";
// Route handler en vez de `sitemap.ts` para que se genere en cada request:
// así incluye los productos publicados después del build y respeta APP_URL.
export const dynamic = "force-dynamic";

type Entry = { url: string; lastModified?: Date; priority: number };

function toXml(entries: Entry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>${
      entry.lastModified ? `\n    <lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""
    }
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function GET() {
  const base = siteUrl();

  const entries: Entry[] = [
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

    entries.push(
      ...categories.map((category) => ({
        url: `${base}/coleccion/${category.slug}`,
        priority: 0.7,
      })),
      ...products.map((product) => ({
        url: `${base}/producto/${product.slug}`,
        lastModified: product.updatedAt,
        priority: 0.8,
      })),
    );
  } catch (error) {
    console.error("[sitemap] No se pudo leer el catálogo:", error);
  }

  return new Response(toXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
