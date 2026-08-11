import type { Metadata } from "next";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog-view";

export const revalidate = 60;

const TITLES: Record<string, { title: string; description: string }> = {
  nuevos: {
    title: "Nuevos lanzamientos",
    description: "Lo último que llegó a Chile desde STARSEEKER.",
  },
  "mas-vendidos": {
    title: "Más vendidos",
    description: "Los equipos que más eligen los baristas caseros en Chile.",
  },
  ofertas: {
    title: "Ofertas",
    description: "Precios rebajados por tiempo limitado, con la misma garantía oficial.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const preset = params.filtro ? TITLES[params.filtro] : undefined;
  return {
    title: preset?.title ?? "Todos los productos",
    description:
      preset?.description ??
      "Molinos, máquinas de espresso y accesorios STARSEEKER con garantía oficial en Chile.",
  };
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const preset = params.filtro ? TITLES[params.filtro] : undefined;

  return (
    <CatalogView
      basePath="/productos"
      searchParams={params}
      title={preset?.title ?? "Todos los productos"}
      description={
        preset?.description ??
        "Catálogo completo STARSEEKER Chile. Envíos a todo el país y garantía local."
      }
    />
  );
}
