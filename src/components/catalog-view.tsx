import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { CatalogBar } from "@/components/catalog-filters";
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
  return value === "nuevos" ||
    value === "mas-vendidos" ||
    value === "ofertas" ||
    value === "destacados"
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
  const carried = new URLSearchParams(
    Object.entries(searchParams).filter(([key, value]) => value && key !== "pagina") as [
      string,
      string,
    ][],
  );

  return (
    <div className="pb-20">
      <header className="border-b border-ink-line">
        <div className="container-page py-12">
          <h1 className="section-title text-4xl sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mute">{description}</p>
          )}
        </div>
      </header>

      <div className="container-page">

      <Suspense fallback={<div className="h-20" />}>
        <CatalogBar total={total} />
      </Suspense>

      <ProductGrid products={products} />

      {pages > 1 && (
        <nav className="mt-14 flex flex-wrap justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: pages }, (_, index) => index + 1).map((number) => {
            const params = new URLSearchParams(carried);
            if (number > 1) params.set("pagina", String(number));
            const query = params.toString();
            return (
              <Link
                key={number}
                href={query ? `${basePath}?${query}` : basePath}
                aria-current={number === page ? "page" : undefined}
                className={`tnum grid h-10 w-10 place-items-center border text-xs transition ${
                  number === page
                    ? "border-bone bg-bone font-semibold text-ink"
                    : "border-ink-line text-mute hover:border-bone hover:text-bone"
                }`}
              >
                {number}
              </Link>
            );
          })}
        </nav>
      )}
      </div>
    </div>
  );
}
