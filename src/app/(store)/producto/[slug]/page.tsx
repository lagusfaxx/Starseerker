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
import { CheckIcon, ShieldIcon, TruckIcon } from "@/components/icons";

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

      <div className="container-page py-8">
        <nav aria-label="Ruta de navegación" className="text-xs text-mute">
          <Link href="/" className="link-quiet">
            Inicio
          </Link>
          <span className="mx-2 text-ink-line">/</span>
          <Link href="/productos" className="link-quiet">
            Productos
          </Link>
          {product.category && (
            <>
              <span className="mx-2 text-ink-line">/</span>
              <Link href={`/coleccion/${product.category.slug}`} className="link-quiet">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2 text-ink-line">/</span>
          <span className="text-bone/70">{product.name}</span>
        </nav>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          {/* Caja de compra */}
          <div className="lg:sticky lg:top-40 lg:self-start">
            {product.subtitle && <p className="eyebrow">{product.subtitle}</p>}
            <h1 className="display mt-2 text-[1.75rem] lg:text-[2.125rem]">{product.name}</h1>

            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mute">
              <div className="flex gap-1.5">
                <dt>SKU</dt>
                <dd className="tnum text-bone/70">{product.sku}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Disponibilidad</dt>
                <dd className={product.stock > 0 ? "text-bone/70" : "text-red-400"}>
                  {product.stock > 0
                    ? product.stock <= 5
                      ? `Últimas ${product.stock} unidades`
                      : "En stock"
                    : "Sin stock"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-baseline gap-3 border-y border-ink-line py-5">
              <span className="tnum text-[2rem] font-semibold">{formatCLP(product.price)}</span>
              {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
                <>
                  <span className="tnum text-sm text-mute line-through">
                    {formatCLP(product.compareAtPrice)}
                  </span>
                  <span className="bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">
                    -{off}%
                  </span>
                </>
              )}
              <span className="w-full text-xs text-mute">
                Precio final con IVA incluido. Cuotas disponibles con Mercado Pago.
              </span>
            </div>

            {highlights.length > 0 && (
              <ul className="mt-6 space-y-2.5 text-sm text-bone/85">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon size={17} className="mt-0.5 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-7">
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

            <ul className="mt-6 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-2">
              <li className="flex gap-3 bg-ink p-4">
                <ShieldIcon size={19} className="mt-0.5 shrink-0 text-accent" />
                <div className="text-xs">
                  <p className="font-semibold text-bone">Garantía oficial</p>
                  <p className="mt-0.5 text-mute">{product.warrantyMonths} meses en Chile</p>
                </div>
              </li>
              <li className="flex gap-3 bg-ink p-4">
                <TruckIcon size={19} className="mt-0.5 shrink-0 text-accent" />
                <div className="text-xs">
                  <p className="font-semibold text-bone">Despacho nacional</p>
                  <p className="mt-0.5 text-mute">
                    {settings.freeShippingThreshold
                      ? `Gratis sobre ${formatCLP(settings.freeShippingThreshold)}`
                      : "Tarifa según región"}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-4">
              <ShippingEstimator subtotal={product.price} />
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div className="mt-16 grid gap-12 border-t border-ink-line pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <section>
            <h2 className="eyebrow text-bone">Descripción</h2>
            {product.description ? (
              <div className="mt-4 space-y-4 text-sm leading-relaxed whitespace-pre-line text-bone/80">
                {product.description}
              </div>
            ) : (
              <p className="mt-4 text-sm text-mute">
                Este producto todavía no tiene descripción cargada.
              </p>
            )}
          </section>

          <section>
            <h2 className="eyebrow text-bone">Ficha técnica</h2>
            {specs.length > 0 ? (
              <table className="mt-4 w-full border border-ink-line text-sm">
                <tbody className="divide-y divide-ink-line">
                  {specs.map((spec) => (
                    <tr key={spec.label}>
                      <th
                        scope="row"
                        className="w-1/2 px-4 py-2.5 text-left font-normal text-mute"
                      >
                        {spec.label}
                      </th>
                      <td className="px-4 py-2.5 font-medium">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-4 text-sm text-mute">Ficha técnica no disponible.</p>
            )}

            <h2 className="eyebrow mt-10 text-bone">Garantía y devoluciones</h2>
            <p className="mt-4 text-sm leading-relaxed text-mute">
              {product.warrantyMonths} meses de garantía por defectos de fabricación, gestionada en
              Chile. Además tienes 10 días corridos de retracto desde que recibes el producto,
              siempre que esté sin uso y en su embalaje original.{" "}
              <Link href="/ayuda/garantia" className="text-bone underline underline-offset-4">
                Ver detalle
              </Link>
              .
            </p>
          </section>
        </div>

        {crossSell.length > 0 && (
          <section className="mt-20 border-t border-ink-line pt-12">
            <h2 className="display text-2xl">Productos relacionados</h2>
            <div className="mt-7">
              <ProductGrid products={crossSell} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
