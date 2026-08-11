import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog-view";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

async function getCategory(slug: string) {
  try {
    return await prisma.category.findFirst({ where: { slug, active: true } });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Colección" };
  return {
    title: category.name,
    description: category.description ?? `Productos ${category.name} STARSEEKER en Chile.`,
    alternates: { canonical: `/coleccion/${category.slug}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <CatalogView
      basePath={`/coleccion/${category.slug}`}
      categorySlug={category.slug}
      searchParams={search}
      title={category.name}
      description={category.description}
      breadcrumb={[{ label: "Productos", href: "/productos" }]}
    />
  );
}
