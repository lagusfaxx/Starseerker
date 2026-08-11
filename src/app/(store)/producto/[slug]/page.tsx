import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGrid } from "@/components/product-grid";
import { ShippingEstimator } from "@/components/shipping-estimator";
import { getProductBySlug, safeListProducts } from "@/lib/queries";
import { discountPercent, formatCLP } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

type Spec = { label: string; value: string };

function asSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is Spec =>
      !!s && typeof s === "object" && typeof s.label === "string" && typeof s.value === "string",
  );
}

function asHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
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

  const related = await safeListProducts({
    categorySlug: product.category?.slug,
    take: 4,
  });

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
    image: product.images.map((i) => i.url),
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

      <div className="container-page py-10">
        <nav className="mb-6 text-xs text-mute">
          <Link href="/" className="hover:text-bone">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          {product.category ? (
            <>
              <Link href={`/coleccion/${product.category.slug}`} className="hover:text-bone">
                {product.category.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : null}
          <span className="text-bone/70">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            {product.subtitle && (
              <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                {product.subtitle}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-black tracking-tight text-balance sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold">{formatCLP(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-base text-mute line-through">
                    {formatCLP(product.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-ink">
                    Ahorra {off}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-mute">
              Precio con IVA incluido · SKU {product.sku} ·{" "}
              {product.stock > 0 ? (
                <span className="text-accent">
                  {product.stock <= 5 ? `Últimas ${product.stock} unidades` : "En stock"}
                </span>
              ) : (
                <span className="text-red-400">Sin stock</span>
              )}
            </p>

            {highlights.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm text-bone/85">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-accent">✓</span>
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

            <div className="mt-6 grid gap-3 text-xs text-mute sm:grid-cols-2">
              <div className="rounded-xl border border-ink-line px-4 py-3">
                <strong className="block text-bone">Garantía oficial</strong>
                {product.warrantyMonths} meses en Chile
              </div>
              <div className="rounded-xl border border-ink-line px-4 py-3">
                <strong className="block text-bone">Despacho</strong>
                {settings.freeShippingThreshold
                  ? `Gratis sobre ${formatCLP(settings.freeShippingThreshold)}`
                  : "Tarifa según región"}
              </div>
            </div>

            <div className="mt-6">
              <ShippingEstimator subtotal={product.price} />
            </div>

            {product.description && (
              <section className="mt-10 border-t border-ink-line pt-8">
                <h2 className="text-sm font-bold tracking-[0.14em] uppercase">Descripción</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed whitespace-pre-line text-bone/80">
                  {product.description}
                </div>
              </section>
            )}

            {specs.length > 0 && (
              <section className="mt-8 border-t border-ink-line pt-8">
                <h2 className="text-sm font-bold tracking-[0.14em] uppercase">Ficha técnica</h2>
                <dl className="mt-4 divide-y divide-ink-line text-sm">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-6 py-2.5">
                      <dt className="text-mute">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>

        {related.products.filter((p) => p.id !== product.id).length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold">También te puede interesar</h2>
            <div className="mt-6">
              <ProductGrid products={related.products.filter((p) => p.id !== product.id)} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
