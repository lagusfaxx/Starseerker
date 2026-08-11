"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon, FilterIcon } from "@/components/icons";

export type FilterCategory = { slug: string; name: string; count: number };

const TAGS = [
  { value: "nuevos", label: "Novedades" },
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "ofertas", label: "En oferta" },
];

const SORTS = [
  { value: "recomendados", label: "Recomendados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevos", label: "Más recientes" },
];

function useUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return {
    params,
    href(patch: Record<string, string | null>) {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      next.delete("pagina");
      const query = next.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    go(patch: Record<string, string | null>) {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      next.delete("pagina");
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
  };
}

/** Panel lateral de filtros del catálogo. */
export function CatalogFilters({
  categories,
  activeCategory,
}: {
  categories: FilterCategory[];
  activeCategory?: string;
}) {
  const { params, href, go } = useUpdater();
  const [open, setOpen] = useState(false);

  const activeTag = params.get("filtro");
  const inStock = params.get("stock") === "1";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";

  const hasFilters = Boolean(activeTag || inStock || min || max);

  const body = (
    <div className="space-y-8">
      {categories.length > 0 && (
        <section>
          <h3 className="eyebrow text-bone">Categoría</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link
                href="/productos"
                className={!activeCategory ? "font-semibold" : "link-quiet"}
              >
                Todas
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug} className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/coleccion/${category.slug}`}
                  className={activeCategory === category.slug ? "font-semibold" : "link-quiet"}
                >
                  {category.name}
                </Link>
                <span className="tnum text-xs text-mute">{category.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="eyebrow text-bone">Destacados</h3>
        <ul className="mt-3 space-y-1.5 text-sm">
          {TAGS.map((tag) => (
            <li key={tag.value}>
              <Link
                href={href({ filtro: activeTag === tag.value ? null : tag.value })}
                className={activeTag === tag.value ? "font-semibold" : "link-quiet"}
              >
                {tag.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="eyebrow text-bone">Disponibilidad</h3>
        <label className="mt-3 flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => go({ stock: event.target.checked ? "1" : null })}
            className="h-4 w-4"
          />
          Solo productos con stock
        </label>
      </section>

      <section>
        <h3 className="eyebrow text-bone">Precio (CLP)</h3>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            go({
              min: String(data.get("min") ?? "") || null,
              max: String(data.get("max") ?? "") || null,
            });
          }}
        >
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={min}
            placeholder="Mín."
            className="field tnum py-2 text-xs"
            aria-label="Precio mínimo"
          />
          <span className="text-mute">–</span>
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={max}
            placeholder="Máx."
            className="field tnum py-2 text-xs"
            aria-label="Precio máximo"
          />
          <button className="btn btn-outline btn-sm shrink-0">Ir</button>
        </form>
      </section>

      {hasFilters && (
        <button
          onClick={() => go({ filtro: null, stock: null, min: null, max: null })}
          className="link-quiet text-xs underline underline-offset-4"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="hidden lg:block">
        <div className="sticky top-40">{body}</div>
      </aside>

      {/* Móvil */}
      <button
        onClick={() => setOpen(true)}
        className="btn btn-outline btn-sm lg:hidden"
        aria-label="Abrir filtros"
      >
        <FilterIcon size={15} />
        Filtros
        {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar filtros"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col border-r border-ink-line bg-ink">
            <div className="flex h-14 items-center justify-between border-b border-ink-line px-5">
              <h2 className="eyebrow text-bone">Filtros</h2>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1">
                <CloseIcon size={19} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{body}</div>
          </div>
        </div>
      )}
    </>
  );
}

/** Selector de orden, junto al contador de resultados. */
export function CatalogSort() {
  const { params, go } = useUpdater();

  return (
    <label className="flex items-center gap-2 text-xs text-mute">
      Ordenar por
      <select
        value={params.get("orden") ?? "recomendados"}
        onChange={(event) =>
          go({ orden: event.target.value === "recomendados" ? null : event.target.value })
        }
        className="field w-auto py-1.5 text-xs"
        aria-label="Ordenar productos"
      >
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  );
}
