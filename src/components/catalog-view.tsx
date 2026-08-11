import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { CatalogFilters, CatalogSort, type FilterCategory } from "@/components/catalog-filters";
import { safeListProducts, type ProductFilter } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 24;

export type CatalogSearchParams = {
  filtro?: string;
  orden?: string;
  stock?: string;
  pagina?: string;
  min?: string;
  max?: string;
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

function parseAmount(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function filterCategories(): Promise<FilterCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      select: {
        slug: true,
        name: true,
        _count: { select: { products: { where: { active: true } } } },
      },
    });
    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category._count.products,
    }));
  } catch {
    return [];
  }
}

export async function CatalogView({
  title,
  description,
  categorySlug,
  searchParams,
  basePath,
  breadcrumb,
}: {
  title: string;
  description?: string | null;
  categorySlug?: string;
  searchParams: CatalogSearchParams;
  basePath: string;
  breadcrumb?: { label: string; href: string }[];
}) {
  const page = Math.max(1, Number(searchParams.pagina) || 1);

  const [{ products, total }, categories] = await Promise.all([
    safeListProducts({
      categorySlug,
      search: searchParams.q?.trim() || undefined,
      filter: parseFilter(searchParams.filtro),
      sort: parseSort(searchParams.orden),
      onlyInStock: searchParams.stock === "1",
      minPrice: parseAmount(searchParams.min),
      maxPrice: parseAmount(searchParams.max),
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    filterCategories(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const carried = new URLSearchParams(
    Object.entries(searchParams).filter(([key, value]) => value && key !== "pagina") as [
      string,
      string,
    ][],
  );

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="container-page py-8 lg:py-10">
      <nav aria-label="Ruta de navegación" className="text-xs text-mute">
        <Link href="/" className="link-quiet">
          Inicio
        </Link>
        {breadcrumb?.map((crumb) => (
          <span key={crumb.href}>
            <span className="mx-2 text-ink-line">/</span>
            <Link href={crumb.href} className="link-quiet">
              {crumb.label}
            </Link>
          </span>
        ))}
        <span className="mx-2 text-ink-line">/</span>
        <span className="text-bone/70">{title}</span>
      </nav>

      <header className="mt-5 border-b border-ink-line pb-6">
        <h1 className="display text-3xl lg:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-mute">{description}</p>}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[210px_1fr] lg:gap-12">
        <Suspense fallback={<div className="hidden lg:block" />}>
          <CatalogFilters categories={categories} activeCategory={categorySlug} />
        </Suspense>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-line pb-4">
            <p className="tnum text-xs text-mute">
              {total === 0 ? "Sin resultados" : `Mostrando ${from}–${to} de ${total} productos`}
            </p>
            <Suspense fallback={null}>
              <CatalogSort />
            </Suspense>
          </div>

          <div className="mt-7">
            <ProductGrid products={products} />
          </div>

          {pages > 1 && (
            <nav className="mt-12 flex flex-wrap justify-center gap-1.5" aria-label="Paginación">
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => {
                const params = new URLSearchParams(carried);
                if (number > 1) params.set("pagina", String(number));
                const query = params.toString();
                return (
                  <Link
                    key={number}
                    href={query ? `${basePath}?${query}` : basePath}
                    aria-current={number === page ? "page" : undefined}
                    className={`tnum grid h-9 w-9 place-items-center border text-xs transition ${
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
    </div>
  );
}
