import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGrid } from "@/components/product-grid";
import { SectionTitle } from "@/components/section-title";
import { ShippingEstimator } from "@/components/shipping-estimator";
import { getProductBySlug, safeListProducts } from "@/lib/queries";
import { discountPercent, formatCLP } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { CheckIcon } from "@/components/icons";

export const revalidate = 60;

type Spec = { label: string; value: string };

function asSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (spec): spec is Spec =>
      !!spec &&
      typeof spec === "object" &&
      typeof spec.label === "string" &&
      typeof spec.value === "string",
  );
}

function asHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

async function load(slug: string) {
  try {
    return await getProductBySlug(slug);
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
  const product = await load(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.seoTitle ?? product.name,
    description:
      product.seoDescription ??
      product.subtitle ??
      (product.description.slice(0, 155) || undefined),
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([load(slug), getSettings()]);
  if (!product) notFound();

  const related = await safeListProducts({ categorySlug: product.category?.slug, take: 5 });
  const crossSell = related.products.filter((item) => item.id !== product.id).slice(0, 4);

  const specs = asSpecs(product.specs);
  const highlights = asHighlights(product.highlights);
  const off = discountPercent(product.price, product.compareAtPrice);
  const image = product.images[0]?.url ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.subtitle ?? product.description.slice(0, 300),
    image: product.images.map((item) => item.url),
    brand: { "@type": "Brand", name: "STARSEEKER" },
    offers: {
      "@type": "Offer",
      priceCurrency: "CLP",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: settings.storeName },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page pt-10 pb-20">
        <nav aria-label="Ruta de navegación" className="text-xs text-mute">
          <Link href="/" className="link-quiet">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/productos" className="link-quiet">
            Colección
          </Link>
          <span className="mx-2">/</span>
          <span className="text-bone/70">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:pt-6">
            {product.subtitle && <p className="eyebrow">{product.subtitle}</p>}
            <h1 className="display mt-3 text-[1.75rem] lg:text-[2.25rem]">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="tnum text-[1.75rem] font-semibold">{formatCLP(product.price)}</span>
              {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
                <>
                  <span className="tnum text-sm text-mute line-through">
                    {formatCLP(product.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-bone px-2.5 py-1 text-[11px] font-semibold text-black">
                    -{off}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-mute">
              IVA incluido · Cuotas con Mercado Pago ·{" "}
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-accent">Últimas {product.stock} unidades</span>
                ) : (
                  "En stock"
                )
              ) : (
                <span className="text-red-400">Sin stock</span>
              )}
            </p>

            {highlights.length > 0 && (
              <ul className="mt-7 space-y-3 text-sm text-bone/85">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckIcon size={17} className="mt-0.5 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <AddToCart
                item={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  image,
                  maxStock: product.stock,
                }}
              />
            </div>

            <p className="mt-5 text-xs text-mute">
              Producto original · 10 días de retracto según la Ley del Consumidor · Despacho a
              todo Chile
            </p>

            <div className="mt-7">
              <ShippingEstimator subtotal={product.price} />
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div className="mx-auto mt-20 max-w-3xl">
          {product.description && (
            <section>
              <h2 className="display text-xl">Sobre este producto</h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed whitespace-pre-line text-bone/80">
                {product.description}
              </div>
            </section>
          )}

          {specs.length > 0 && (
            <section className="mt-14">
              <h2 className="display text-xl">Especificaciones</h2>
              <dl className="mt-5 divide-y divide-ink-line border-y border-ink-line text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-8 py-3">
                    <dt className="text-mute">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        {crossSell.length > 0 && (
          <section>
            <SectionTitle title="También te puede gustar" />
            <ProductGrid products={crossSell} />
          </section>
        )}
      </div>
    </>
  );
}
