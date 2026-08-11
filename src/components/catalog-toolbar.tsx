"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "recomendados", label: "Recomendados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevos", label: "Más recientes" },
];

export function CatalogToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("pagina");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-line pb-4">
      <p className="text-sm text-mute">
        {total} {total === 1 ? "producto" : "productos"}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-mute">
          <input
            type="checkbox"
            checked={params.get("stock") === "1"}
            onChange={(e) => update("stock", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-[#d7b56d]"
          />
          Solo con stock
        </label>

        <select
          value={params.get("orden") ?? "recomendados"}
          onChange={(e) => update("orden", e.target.value === "recomendados" ? null : e.target.value)}
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
    </div>
  );
}
