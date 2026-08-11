import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentArticle } from "@/components/content-page";
import { HELP_PAGES, findContent } from "@/lib/content";

export function generateStaticParams() {
  return HELP_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findContent(HELP_PAGES, slug);
  if (!page) return { title: "Ayuda" };
  return {
    title: page.title,
    description: page.summary,
    alternates: { canonical: `/ayuda/${page.slug}` },
  };
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findContent(HELP_PAGES, slug);
  if (!page) notFound();
  return <ContentArticle page={page} />;
}
