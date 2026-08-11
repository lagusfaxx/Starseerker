import { prisma } from "@/lib/prisma";
import { getHomeBlocks, BLOCK_LABELS, type BlockType, type HomeBlock } from "@/lib/home";
import { ImageUrlField, ImageListField } from "@/components/admin/image-url-field";
import {
  addHomeBlock,
  moveHomeBlock,
  removeHomeBlock,
  saveHomeBlock,
  toggleHomeBlock,
} from "@/app/admin/home-actions";

export const dynamic = "force-dynamic";

const TYPES: BlockType[] = ["hero", "products", "categories", "gallery", "mediaText", "banner"];

const PRODUCT_FILTERS = [
  { value: "nuevos", label: "Novedades" },
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "ofertas", label: "En oferta" },
  { value: "destacados", label: "Destacados" },
  { value: "", label: "Todos los productos" },
];

export default async function AdminHomePage() {
  const [blocks, categories] = await Promise.all([
    getHomeBlocks(),
    prisma.category.findMany({ orderBy: { position: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Portada</h1>
      <p className="mt-2 text-sm text-mute">
        Abre un bloque para editarlo. En cualquier campo de imagen puedes pegar la URL de una foto o
        de un video <code className="text-bone">.mp4</code>. Los bloques vacíos no se muestran en la
        tienda.
      </p>

      <ol className="mt-8 space-y-5">
        {blocks.map((block, index) => (
          <li key={block.id} className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="tnum text-xs text-mute">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate text-sm font-semibold">
                  {BLOCK_LABELS[block.type]}
                  {summarize(block) && (
                    <span className="ml-2 font-normal text-mute">{summarize(block)}</span>
                  )}
                </span>
                {!block.active && (
                  <span className="border border-ink-line px-2 py-0.5 text-[10px] text-mute">
                    Oculto
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <MiniButton action={moveHomeBlock} id={block.id} extra={{ direction: "up" }}>
                  Subir
                </MiniButton>
                <MiniButton action={moveHomeBlock} id={block.id} extra={{ direction: "down" }}>
                  Bajar
                </MiniButton>
                <MiniButton action={toggleHomeBlock} id={block.id}>
                  {block.active ? "Ocultar" : "Mostrar"}
                </MiniButton>
                <MiniButton action={removeHomeBlock} id={block.id} danger>
                  Eliminar
                </MiniButton>
              </div>
            </div>

            <details className="group border-t border-ink-line">
              <summary className="cursor-pointer list-none px-5 py-3 text-xs text-mute hover:text-bone">
                <span className="group-open:hidden">Editar</span>
                <span className="hidden group-open:inline">Cerrar</span>
              </summary>
              <form action={saveHomeBlock} className="space-y-4 border-t border-ink-line p-5">
                <input type="hidden" name="id" value={block.id} />
                <BlockFields block={block} categories={categories} />
                <button className="btn btn-light btn-sm">Guardar bloque</button>
              </form>
            </details>
          </li>
        ))}
      </ol>

      <form action={addHomeBlock} className="panel mt-6 flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-56 flex-1">
          <label className="field-label">Agregar bloque al final</label>
          <select name="type" className="field" defaultValue="products">
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {BLOCK_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-outline btn-sm">Agregar</button>
      </form>
    </div>
  );
}

/** Una línea con lo más identificable del bloque, para reconocerlo cerrado. */
function summarize(block: HomeBlock): string {
  switch (block.type) {
    case "hero":
      return block.overlayText || block.bandText || "";
    case "products":
      return block.title;
    case "categories":
      return block.title;
    case "gallery":
      return `${block.title || "Sin título"} · ${block.items.length} archivos`;
    case "mediaText":
      return block.title || "";
    case "banner":
      return block.title || "";
    default:
      return "";
  }
}

function MiniButton({
  action,
  id,
  extra,
  danger,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  extra?: Record<string, string>;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {extra &&
        Object.entries(extra).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <button
        className={`text-xs transition ${danger ? "text-red-400/80 hover:text-red-300" : "link-quiet"}`}
      >
        {children}
      </button>
    </form>
  );
}

function Text({
  name,
  label,
  value,
  placeholder,
}: {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input name={name} defaultValue={value} placeholder={placeholder} className="field" />
    </div>
  );
}

function BlockFields({
  block,
  categories,
}: {
  block: HomeBlock;
  categories: { slug: string; name: string }[];
}) {
  switch (block.type) {
    case "hero":
      return (
        <>
          <ImageUrlField
            name="mediaUrl"
            label="Video o imagen de portada"
            defaultValue={block.mediaUrl}
            hint="URL de un .mp4 o de una imagen. Ocupa todo el ancho."
            previewClassName="h-28 w-44"
          />
          <ImageUrlField
            name="posterUrl"
            label="Imagen de respaldo del video"
            defaultValue={block.posterUrl}
            hint="Se muestra mientras el video carga."
            previewClassName="h-28 w-44"
          />
          <Text
            name="overlayText"
            label="Frase sobre el video"
            value={block.overlayText}
            placeholder="Convierte el café de especialidad en algo diario"
          />
          <Text
            name="bandText"
            label="Texto de la franja de abajo"
            value={block.bandText}
            placeholder="Molinos eléctricos y máquinas de espresso portátiles"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="ctaLabel" label="Botón (vacío = sin botón)" value={block.ctaLabel} />
            <Text name="ctaHref" label="Enlace del botón" value={block.ctaHref} />
          </div>
        </>
      );

    case "products":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="title" label="Título" value={block.title} />
            <div>
              <label className="field-label">Qué productos muestra</label>
              <select name="filter" defaultValue={block.filter} className="field">
                {PRODUCT_FILTERS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Solo de esta categoría</label>
              <select name="categorySlug" defaultValue={block.categorySlug} className="field">
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Cantidad</label>
              <input
                name="limit"
                type="number"
                min={1}
                max={12}
                defaultValue={block.limit}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Formato</label>
              <select name="layout" defaultValue={block.layout} className="field">
                <option value="grid">Grilla</option>
                <option value="carousel">Carrusel</option>
              </select>
            </div>
            <Text name="linkLabel" label="Enlace (vacío = sin enlace)" value={block.linkLabel} />
            <Text name="linkHref" label="Destino del enlace" value={block.linkHref} />
          </div>
        </>
      );

    case "categories":
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Text name="title" label="Título" value={block.title} />
          <Text name="linkLabel" label="Enlace (opcional)" value={block.linkLabel} />
          <Text name="linkHref" label="Destino del enlace" value={block.linkHref} />
          <p className="text-xs text-mute sm:col-span-3">
            La imagen de cada categoría se edita en Panel → Categorías.
          </p>
        </div>
      );

    case "gallery":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="title" label="Título" value={block.title} />
            <div>
              <label className="field-label">Formato</label>
              <select name="layout" defaultValue={block.layout} className="field">
                <option value="grid">Grilla</option>
                <option value="carousel">Carrusel</option>
              </select>
            </div>
          </div>
          <ImageListField
            name="items"
            label="Imágenes o videos"
            defaultValue={block.items.join("\n")}
            hint="Una URL por línea. Acepta fotos y videos .mp4."
          />
        </>
      );

    case "mediaText":
      return (
        <>
          <ImageUrlField
            name="mediaUrl"
            label="Imagen o video"
            defaultValue={block.mediaUrl}
            previewClassName="h-28 w-44"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="eyebrow" label="Antetítulo (opcional)" value={block.eyebrow} />
            <Text name="title" label="Título" value={block.title} />
          </div>
          <div>
            <label className="field-label">Texto</label>
            <textarea name="body" rows={4} defaultValue={block.body} className="field" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="ctaLabel" label="Botón (opcional)" value={block.ctaLabel} />
            <Text name="ctaHref" label="Enlace del botón" value={block.ctaHref} />
          </div>
          <label className="flex items-center gap-2 text-xs text-mute">
            <input
              type="checkbox"
              name="reversed"
              defaultChecked={block.reversed}
              className="h-4 w-4"
            />
            Invertir: el texto a la izquierda y la imagen a la derecha
          </label>
        </>
      );

    case "banner":
      return (
        <>
          <Text name="title" label="Título" value={block.title} />
          <div>
            <label className="field-label">Texto</label>
            <textarea name="body" rows={3} defaultValue={block.body} className="field" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="ctaLabel" label="Botón (opcional)" value={block.ctaLabel} />
            <Text name="ctaHref" label="Enlace del botón" value={block.ctaHref} />
          </div>
        </>
      );

    default:
      return null;
  }
}
