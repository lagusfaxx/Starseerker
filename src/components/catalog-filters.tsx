"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const AVAILABILITY = [
  { value: "", label: "Disponibilidad" },
  { value: "1", label: "Solo con stock" },
];

const SORTS = [
  { value: "recomendados", label: "Recomendados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevos", label: "Más recientes" },
];

/**
 * Barra de catálogo: disponibilidad a la izquierda, total al centro y orden a
 * la derecha, como en la tienda de referencia.
 */
export function CatalogBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("pagina");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <select
        value={params.get("stock") ?? ""}
        onChange={(event) => go("stock", event.target.value || null)}
        className="field w-auto py-2 text-xs"
        aria-label="Disponibilidad"
      >
        {AVAILABILITY.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <p className="tnum order-last w-full text-center text-xs text-mute sm:order-none sm:w-auto">
        {total} {total === 1 ? "producto" : "productos"}
      </p>

      <select
        value={params.get("orden") ?? "recomendados"}
        onChange={(event) =>
          go("orden", event.target.value === "recomendados" ? null : event.target.value)
        }
        className="field w-auto py-2 text-xs"
        aria-label="Ordenar productos"
      >
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
    </div>
  );
}
