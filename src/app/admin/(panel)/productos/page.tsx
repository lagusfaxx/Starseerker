import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/format";
import { deleteCategory, saveCategory, toggleProductActive } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
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
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

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
            className="rounded-full bg-bone px-5 py-2.5 text-sm font-bold text-ink"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="card-surface mt-6 overflow-x-auto">
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
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white">
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
                      className={`rounded-full border px-3 py-1 text-xs ${
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

      <section className="mt-12">
        <h2 className="text-lg font-bold">Categorías</h2>
        <p className="mt-1 text-xs text-mute">
          Las categorías aparecen en el menú principal y en la portada.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card-surface overflow-hidden">
            <ul className="divide-y divide-ink-line">
              {categories.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-mute">Sin categorías aún.</li>
              )}
              {categories.map((category) => (
                <li key={category.id} className="px-5 py-4">
                  <form action={saveCategory} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input type="hidden" name="id" value={category.id} />
                    <input name="name" defaultValue={category.name} className="field" />
                    <input
                      name="image"
                      defaultValue={category.image ?? ""}
                      placeholder="URL de imagen"
                      className="field"
                    />
                    <input
                      name="description"
                      defaultValue={category.description ?? ""}
                      placeholder="Descripción"
                      className="field sm:col-span-2"
                    />
                    <input
                      name="position"
                      type="number"
                      defaultValue={category.position}
                      className="field sm:w-24"
                    />
                    <div className="flex items-center gap-3 sm:col-span-3">
                      <label className="flex items-center gap-2 text-xs text-mute">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={category.active}
                          className="h-4 w-4 accent-[#d7b56d]"
                        />
                        Activa
                      </label>
                      <button className="rounded-full border border-ink-line px-4 py-1.5 text-xs hover:border-bone">
                        Guardar
                      </button>
                    </div>
                  </form>
                  <form action={deleteCategory} className="mt-2">
                    <input type="hidden" name="id" value={category.id} />
                    <button className="text-xs text-red-400/80 hover:text-red-300">Eliminar</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>

          <form action={saveCategory} className="card-surface h-fit space-y-3 p-5">
            <h3 className="text-sm font-bold">Nueva categoría</h3>
            <div>
              <label className="field-label">Nombre</label>
              <input name="name" className="field" required />
            </div>
            <div>
              <label className="field-label">Descripción</label>
              <input name="description" className="field" />
            </div>
            <div>
              <label className="field-label">Imagen (URL)</label>
              <input name="image" className="field" />
            </div>
            <div>
              <label className="field-label">Orden</label>
              <input name="position" type="number" defaultValue={0} className="field" />
            </div>
            <label className="flex items-center gap-2 text-xs text-mute">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 accent-[#d7b56d]"
              />
              Activa
            </label>
            <button className="w-full rounded-full bg-bone py-2.5 text-sm font-bold text-ink">
              Crear categoría
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
