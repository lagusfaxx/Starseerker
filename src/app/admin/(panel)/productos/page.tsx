import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/format";
import { toggleProductActive } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q?.trim()
      ? {
          OR: [
            { name: { contains: q.trim(), mode: "insensitive" } },
            { sku: { contains: q.trim(), mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="flex gap-2">
          <form>
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar producto o SKU"
              className="field w-56 py-2 text-xs"
            />
          </form>
          <Link
            href="/admin/productos/nuevo"
            className="btn btn-light btn-sm"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-ink-line text-left text-xs text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium">Categoría</th>
              <th className="px-5 py-3 font-medium">Precio</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-mute">
                  Todavía no hay productos. Crea el primero.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="transition hover:bg-white/5">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xs bg-white">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-mute">SKU {product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-mute">{product.category?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  {formatCLP(product.price)}
                  {product.compareAtPrice && (
                    <span className="ml-2 text-xs text-mute line-through">
                      {formatCLP(product.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td
                  className={`px-5 py-3 font-semibold ${
                    product.stock === 0 ? "text-red-400" : product.stock <= 3 ? "text-amber-300" : ""
                  }`}
                >
                  {product.stock}
                </td>
                <td className="px-5 py-3">
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={product.id} />
                    <button
                      className={`border px-2.5 py-1 text-[11px] ${
                        product.active
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-ink-line text-mute"
                      }`}
                    >
                      {product.active ? "Publicado" : "Oculto"}
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="text-xs text-mute hover:text-bone"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
