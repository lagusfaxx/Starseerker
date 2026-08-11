import { prisma } from "@/lib/prisma";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { deleteCategory, saveCategory } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Categorías</h1>
      <p className="mt-2 text-sm text-mute">
        Aparecen en el menú, en la portada y como filtro del catálogo. La imagen se usa en el bloque
        de categorías de la portada: puedes pegar una foto o un video.
      </p>

      <section className="panel mt-8 p-5">
        <h2 className="text-sm font-semibold">Nueva categoría</h2>
        <form action={saveCategory} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Nombre</label>
              <input name="name" className="field" required placeholder="Molinos de café" />
            </div>
            <div>
              <label className="field-label">Orden</label>
              <input name="position" type="number" defaultValue={0} className="field" />
            </div>
          </div>
          <div>
            <label className="field-label">Descripción corta</label>
            <input name="description" className="field" />
          </div>
          <ImageUrlField name="image" label="Imagen o video" />
          <label className="flex items-center gap-2 text-xs text-mute">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
            Visible en la tienda
          </label>
          <button className="btn btn-light btn-sm">Crear categoría</button>
        </form>
      </section>

      <ul className="mt-6 space-y-5">
        {categories.length === 0 && (
          <li className="panel px-5 py-10 text-center text-sm text-mute">
            Todavía no hay categorías.
          </li>
        )}

        {categories.map((category) => (
          <li key={category.id} className="panel p-5">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line pb-4">
              <div>
                <h2 className="text-sm font-semibold">{category.name}</h2>
                <p className="mt-0.5 text-xs text-mute">
                  /coleccion/{category.slug} · {category._count.products}{" "}
                  {category._count.products === 1 ? "producto" : "productos"}
                  {!category.active && " · oculta"}
                </p>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <button className="text-xs text-red-400/80 hover:text-red-300">Eliminar</button>
              </form>
            </header>

            <form action={saveCategory} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={category.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Nombre</label>
                  <input name="name" defaultValue={category.name} className="field" required />
                </div>
                <div>
                  <label className="field-label">Orden</label>
                  <input
                    name="position"
                    type="number"
                    defaultValue={category.position}
                    className="field"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Descripción corta</label>
                <input
                  name="description"
                  defaultValue={category.description ?? ""}
                  className="field"
                />
              </div>
              <ImageUrlField
                name="image"
                label="Imagen o video"
                defaultValue={category.image ?? ""}
                previewClassName="h-28 w-40"
              />
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs text-mute">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={category.active}
                    className="h-4 w-4"
                  />
                  Visible en la tienda
                </label>
                <button className="btn btn-light btn-sm">Guardar</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
