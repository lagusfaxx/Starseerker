import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { safeListProducts, type ProductFilter } from "@/lib/queries";

const PAGE_SIZE = 24;

export type CatalogSearchParams = {
  filtro?: string;
  orden?: string;
  stock?: string;
  pagina?: string;
  q?: string;
};

function parseFilter(value?: string): ProductFilter {
  return value === "nuevos" || value === "mas-vendidos" || value === "ofertas" || value === "destacados"
    ? value
    : null;
}

function parseSort(value?: string) {
  return value === "precio-asc" || value === "precio-desc" || value === "nuevos"
    ? value
    : ("recomendados" as const);
}

export async function CatalogView({
  title,
  description,
  categorySlug,
  searchParams,
  basePath,
}: {
  title: string;
  description?: string | null;
  categorySlug?: string;
  searchParams: CatalogSearchParams;
  basePath: string;
}) {
  const page = Math.max(1, Number(searchParams.pagina) || 1);
  const { products, total } = await safeListProducts({
    categorySlug,
    search: searchParams.q?.trim() || undefined,
    filter: parseFilter(searchParams.filtro),
    sort: parseSort(searchParams.orden),
    onlyInStock: searchParams.stock === "1",
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const query = new URLSearchParams(
    Object.entries(searchParams).filter(([k, v]) => v && k !== "pagina") as [string, string][],
  );

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-mute">{description}</p>}
      </header>

      <Suspense fallback={<div className="h-12" />}>
        <CatalogToolbar total={total} />
      </Suspense>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>

      {pages > 1 && (
        <nav className="mt-12 flex flex-wrap justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
            const params = new URLSearchParams(query);
            if (n > 1) params.set("pagina", String(n));
            const href = params.toString() ? `${basePath}?${params}` : basePath;
            return (
              <Link
                key={n}
                href={href}
                className={`grid h-10 w-10 place-items-center rounded-full border text-sm ${
                  n === page
                    ? "border-bone bg-bone font-bold text-ink"
                    : "border-ink-line text-mute hover:border-bone hover:text-bone"
                }`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
