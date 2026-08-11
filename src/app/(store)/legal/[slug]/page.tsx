import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentArticle } from "@/components/content-page";
import { LEGAL_PAGES, findContent } from "@/lib/content";

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findContent(LEGAL_PAGES, slug);
  if (!page) return { title: "Legal" };
  return {
    title: page.title,
    description: page.summary,
    alternates: { canonical: `/legal/${page.slug}` },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findContent(LEGAL_PAGES, slug);
  if (!page) notFound();
  return <ContentArticle page={page} />;
}
