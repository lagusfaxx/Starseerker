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
import { BoxIcon, CardIcon, CheckIcon, TruckIcon } from "@/components/icons";

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

  const [firstParagraph, ...restParagraphs] = product.description.split("\n\n");
  const restOfDescription = restParagraphs.join("\n\n").trim();

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

      {/* Migas de pan */}
      <nav aria-label="Migas de pan" className="border-b border-ink-line">
        <div className="container-page flex flex-wrap items-center gap-2 py-4 font-display text-[11px] tracking-[0.18em] text-mute uppercase">
          <Link href="/" className="hover:text-bone">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/productos" className="hover:text-bone">
            Productos
          </Link>
          {product.category && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/coleccion/${product.category.slug}`} className="hover:text-bone">
                {product.category.name}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-bone">{product.name}</span>
        </div>
      </nav>

      {/* Galería + compra */}
      <div className="container-page grid gap-12 py-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-bone">STARSEEKER</p>

          <h1 className="mt-2 text-4xl lg:text-5xl">{product.name}</h1>

          {product.subtitle && (
            <p className="mt-3 text-base tracking-wide text-mute uppercase">{product.subtitle}</p>
          )}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
              <span className="tnum text-lg text-mute line-through">
                {formatCLP(product.compareAtPrice)}
              </span>
            )}
            <span className="tnum font-display text-3xl font-semibold">
              {formatCLP(product.price)}
            </span>
            {off !== null && <span className="badge bg-bone text-ink">-{off}%</span>}
          </div>

          <p className="mt-2 text-xs text-mute">
            IVA incluido · SKU {product.sku} ·{" "}
            {product.stock > 0
              ? product.stock <= 5
                ? `Últimas ${product.stock} unidades`
                : "En stock"
              : "Sin stock"}
          </p>

          {product.description && (
            <p className="mt-6 text-[15px] leading-relaxed text-bone-soft">{firstParagraph}</p>
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

          <ul className="mt-10 space-y-3 border-t border-ink-line pt-8">
            <Perk icon={<TruckIcon size={20} />}>
              {settings.freeShippingThreshold
                ? `Despacho gratis en compras sobre ${formatCLP(settings.freeShippingThreshold)}`
                : "El costo de despacho se calcula antes de pagar"}
            </Perk>
            <Perk icon={<CardIcon size={20} />}>
              Pago con Mercado Pago: débito, crédito en cuotas y transferencia
            </Perk>
            <Perk icon={<BoxIcon size={20} />}>
              Sigue tu pedido en línea desde el despacho hasta la entrega
            </Perk>
          </ul>

          <div className="mt-8">
            <ShippingEstimator subtotal={product.price} />
          </div>
        </div>
      </div>

      {/* Características y especificaciones */}
      {(highlights.length > 0 || specs.length > 0) && (
        <section className="border-t border-ink-line bg-ink-soft">
          <div className="container-page grid gap-12 py-16 lg:grid-cols-2">
            {highlights.length > 0 && (
              <div>
                <h2 className="section-title">Características</h2>
                <ul className="mt-6 space-y-4">
                  {highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] text-bone-soft">
                      <CheckIcon size={20} className="mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {specs.length > 0 && (
              <div>
                <h2 className="section-title">Especificaciones</h2>
                <dl className="mt-6 divide-y divide-ink-line border-y border-ink-line">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-6 py-3.5">
                      <dt className="font-display text-xs font-semibold tracking-[0.16em] text-mute uppercase">
                        {spec.label}
                      </dt>
                      <dd className="text-right text-sm">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Resto de la descripción: en la caja de compra solo va el primer párrafo. */}
      {restOfDescription && (
        <section className="border-t border-ink-line">
          <div className="container-page max-w-3xl py-16">
            <h2 className="section-title">Sobre este producto</h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed whitespace-pre-line text-bone-soft">
              {restOfDescription}
            </div>
          </div>
        </section>
      )}

      {/* Relacionados */}
      {crossSell.length > 0 && (
        <section className="border-t border-ink-line">
          <div className="container-page py-12">
            <h2 className="section-title">También te puede gustar</h2>
          </div>
          <ProductGrid products={crossSell} />
        </section>
      )}
    </>
  );
}

function Perk({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-bone-soft">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
