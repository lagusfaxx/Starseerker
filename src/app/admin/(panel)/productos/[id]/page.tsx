import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { ArrowLeftIcon } from "@/components/icons";
import { ImageListField } from "@/components/admin/image-url-field";

export const dynamic = "force-dynamic";

type Spec = { label: string; value: string };

function specsToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return (value as Spec[])
    .filter((s) => s && typeof s.label === "string")
    .map((s) => `${s.label}: ${s.value ?? ""}`)
    .join("\n");
}

function linesToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return (value as string[]).filter((v) => typeof v === "string").join("\n");
}

export default async function AdminProductForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nuevo";

  const [product, categories] = await Promise.all([
    isNew
      ? null
      : prisma.product.findUnique({
          where: { id },
          include: { images: { orderBy: { position: "asc" } } },
        }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  if (!isNew && !product) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/productos"
        className="link-quiet inline-flex items-center gap-1.5 text-xs"
      >
        <ArrowLeftIcon size={14} />
        Volver a productos
      </Link>
      <h1 className="mt-3 text-2xl font-bold">
        {isNew ? "Nuevo producto" : `Editar: ${product!.name}`}
      </h1>

      <form action={saveProduct} className="mt-6 space-y-8">
        {product && <input type="hidden" name="id" value={product.id} />}

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Información básica</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label">Nombre *</label>
              <input name="name" defaultValue={product?.name ?? ""} className="field" required />
            </div>
            <div>
              <label className="field-label">Slug (URL)</label>
              <input
                name="slug"
                defaultValue={product?.slug ?? ""}
                placeholder="se genera del nombre"
                className="field"
              />
            </div>
            <div>
              <label className="field-label">SKU</label>
              <input name="sku" defaultValue={product?.sku ?? ""} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Bajada corta</label>
              <input name="subtitle" defaultValue={product?.subtitle ?? ""} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Descripción</label>
              <textarea
                name="description"
                rows={7}
                defaultValue={product?.description ?? ""}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Categoría</label>
              <select name="categoryId" defaultValue={product?.categoryId ?? ""} className="field">
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Orden en listados</label>
              <input
                name="position"
                type="number"
                defaultValue={product?.position ?? 0}
                className="field"
              />
            </div>
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Precio e inventario</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="field-label">Precio CLP *</label>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={product?.price ?? 0}
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label">Precio tachado</label>
              <input
                name="compareAtPrice"
                type="number"
                min={0}
                defaultValue={product?.compareAtPrice ?? ""}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Stock</label>
              <input
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 0}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Peso (g)</label>
              <input
                name="weightGrams"
                type="number"
                min={0}
                defaultValue={product?.weightGrams ?? 1000}
                className="field"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-2">
            {[
              { name: "active", label: "Publicado", value: product?.active ?? true },
              { name: "featured", label: "Destacado en portada", value: product?.featured ?? false },
              { name: "isNew", label: "Nuevo lanzamiento", value: product?.isNew ?? false },
              { name: "bestSeller", label: "Más vendido", value: product?.bestSeller ?? false },
            ].map((flag) => (
              <label key={flag.name} className="flex items-center gap-2 text-xs text-mute">
                <input
                  type="checkbox"
                  name={flag.name}
                  defaultChecked={flag.value}
                  className="h-4 w-4 "
                />
                {flag.label}
              </label>
            ))}
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Imágenes y videos</h2>
          <ImageListField
            name="images"
            label="Archivos del producto"
            defaultValue={(product?.images ?? []).map((image) => image.url).join("\n")}
            hint="Una URL por línea. La primera es la principal. Acepta fotos y videos .mp4."
          />
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Contenido de la ficha</h2>
          <div>
            <label className="field-label">Bullets destacados (uno por línea)</label>
            <textarea
              name="highlights"
              rows={5}
              defaultValue={linesToText(product?.highlights)}
              placeholder={"Muele 30 g en 25 segundos\nBatería para 40 tazas"}
              className="field"
            />
          </div>
          <div>
            <label className="field-label">Ficha técnica (formato «Etiqueta: valor»)</label>
            <textarea
              name="specs"
              rows={7}
              defaultValue={specsToText(product?.specs)}
              placeholder={"Fresas: cónicas de acero 38 mm\nPeso: 640 g\nBatería: 2600 mAh"}
              className="field"
            />
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">SEO</h2>
          <div className="grid gap-4">
            <div>
              <label className="field-label">Título SEO</label>
              <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className="field" />
            </div>
            <div>
              <label className="field-label">Meta descripción</label>
              <textarea
                name="seoDescription"
                rows={3}
                defaultValue={product?.seoDescription ?? ""}
                className="field"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button className="btn btn-light">
            {isNew ? "Crear producto" : "Guardar cambios"}
          </button>
          <Link href="/admin/productos" className="text-xs text-mute hover:text-bone">
            Cancelar
          </Link>
        </div>
      </form>

      {product && (
        <form action={deleteProduct} className="mt-10 border-t border-ink-line pt-6">
          <input type="hidden" name="id" value={product.id} />
          <button className="text-xs text-red-400/80 hover:text-red-300">
            Eliminar este producto
          </button>
        </form>
      )}
    </div>
  );
}
