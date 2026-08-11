import { siteUrl } from "@/lib/site";

export const runtime = "nodejs";
// Se resuelve en cada request para respetar el dominio configurado en runtime.
export const dynamic = "force-dynamic";

const DISALLOW = ["/admin", "/api", "/checkout", "/carrito", "/pedido"];

export async function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${siteUrl()}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
