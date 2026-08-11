import type { Metadata } from "next";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog-view";

export const metadata: Metadata = { title: "Buscar", robots: { index: false } };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  return (
    <CatalogView
      basePath="/buscar"
      searchParams={params}
      title={query ? `Resultados para “${query}”` : "Buscar"}
      description={query ? null : "Escribe qué estás buscando en la barra superior."}
    />
  );
}
