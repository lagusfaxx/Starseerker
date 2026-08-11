import Link from "next/link";
import { Media } from "@/components/media";
import { Carousel } from "@/components/carousel";
import { ProductCard } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { SectionTitle } from "@/components/section-title";
import { safeListCategories, safeListProducts, type ProductFilter } from "@/lib/queries";
import type {
  BannerBlock,
  CategoriesBlock,
  GalleryBlock,
  HeroBlock,
  HomeBlock,
  MediaTextBlock,
  ProductsBlock,
} from "@/lib/home";

export async function HomeBlocks({ blocks }: { blocks: HomeBlock[] }) {
  const visible = blocks.filter((block) => block.active);
  return (
    <>
      {visible.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </>
  );
}

async function RenderBlock({ block }: { block: HomeBlock }) {
  switch (block.type) {
    case "hero":
      return <Hero block={block} />;
    case "products":
      return <Products block={block} />;
    case "categories":
      return <Categories block={block} />;
    case "gallery":
      return <Gallery block={block} />;
    case "mediaText":
      return <MediaText block={block} />;
    case "banner":
      return <Banner block={block} />;
    default:
      return null;
  }
}

function Hero({ block }: { block: HeroBlock }) {
  return (
    <section>
      {(block.mediaUrl || block.posterUrl) && (
        <div className="relative aspect-[21/9] max-h-[76vh] w-full overflow-hidden bg-ink">
          <Media
            url={block.mediaUrl || block.posterUrl}
            poster={block.posterUrl}
            priority
            sizes="100vw"
          />
          {block.overlayText && (
            <>
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <p className="max-w-4xl text-center text-2xl font-light text-white italic drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] sm:text-4xl lg:text-[2.75rem]">
                  {block.overlayText}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {(block.bandText || block.ctaLabel) && (
        <div className="py-10 text-center">
          {block.bandText && (
            <h1 className="container-page section-title text-2xl sm:text-3xl">{block.bandText}</h1>
          )}
          {block.ctaLabel && (
            <Link href={block.ctaHref || "/productos"} className="btn btn-primary mt-7">
              {block.ctaLabel}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function parseFilter(value: string): ProductFilter {
  return value === "nuevos" ||
    value === "mas-vendidos" ||
    value === "ofertas" ||
    value === "destacados"
    ? value
    : null;
}

async function Products({ block }: { block: ProductsBlock }) {
  const { products } = await safeListProducts({
    filter: parseFilter(block.filter),
    categorySlug: block.categorySlug || undefined,
    take: Math.min(Math.max(block.limit || 4, 1), 12),
  });

  if (products.length === 0) return null;

  return (
    <section className="border-t border-ink-line">
      <div className="container-page py-16">
      <SectionTitle
        title={block.title}
        href={block.linkLabel ? block.linkHref || "/productos" : undefined}
        linkLabel={block.linkLabel || undefined}
      />
      {block.layout === "carousel" ? (
        <Carousel>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      ) : (
        <ProductGrid products={products} />
      )}
      </div>
    </section>
  );
}

async function Categories({ block }: { block: CategoriesBlock }) {
  const categories = await safeListCategories();
  if (categories.length === 0) return null;

  return (
    <section className="border-t border-ink-line">
      <div className="container-page py-16">
      <SectionTitle
        title={block.title}
        href={block.linkLabel ? block.linkHref || "/productos" : undefined}
        linkLabel={block.linkLabel || undefined}
      />
      <div className="grid gap-px bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/coleccion/${category.slug}`}
            className="group relative flex aspect-[4/3] items-end justify-center overflow-hidden bg-ink"
          >
            {category.image && (
              <div className="absolute inset-0 opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-70">
                <Media url={category.image} sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative p-7 text-center">
              <h3 className="text-2xl">{category.name}</h3>
              {category.description && (
                <p className="mx-auto mt-1 max-w-xs text-xs text-bone/65">{category.description}</p>
              )}
              <span className="mt-2 inline-block font-display text-[11px] tracking-[0.2em] text-bone/70 uppercase">
                Ver productos
              </span>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}

function Gallery({ block }: { block: GalleryBlock }) {
  const items = block.items.filter(Boolean);
  if (items.length === 0) return null;

  const tile = (url: string, index: number) => (
    <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden bg-ink-soft">
      <Media url={url} sizes="(max-width: 640px) 50vw, 25vw" />
    </div>
  );

  return (
    <section className="border-t border-ink-line">
      <div className="container-page py-16">
      {block.title && <SectionTitle title={block.title} />}
      {block.layout === "carousel" ? (
        <Carousel itemClassName="w-[70%] sm:w-[40%] lg:w-[24%]">
          {items.map(tile)}
        </Carousel>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-ink-line lg:grid-cols-4">{items.map(tile)}</div>
      )}
      </div>
    </section>
  );
}

function MediaText({ block }: { block: MediaTextBlock }) {
  if (!block.mediaUrl && !block.title && !block.body) return null;

  return (
    <section className="border-t border-ink-line">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
        <div
          className={`relative aspect-[4/3] overflow-hidden bg-ink-soft ${
            block.reversed ? "lg:order-2" : ""
          }`}
        >
          <Media url={block.mediaUrl} sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>

        <div className={block.reversed ? "lg:order-1" : ""}>
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          {block.title && <h2 className="section-title mt-3">{block.title}</h2>}
          {block.body && (
            <p className="mt-5 text-[15px] leading-relaxed whitespace-pre-line text-bone-soft">
              {block.body}
            </p>
          )}
          {block.ctaLabel && (
            <Link href={block.ctaHref || "/productos"} className="btn btn-outline mt-8">
              {block.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Banner({ block }: { block: BannerBlock }) {
  if (!block.title && !block.body) return null;

  return (
    <section className="border-t border-ink-line">
      <div className="container-page py-16 text-center">
        {block.title && <h2 className="section-title mx-auto max-w-3xl">{block.title}</h2>}
        {block.body && (
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed whitespace-pre-line text-bone-soft">
            {block.body}
          </p>
        )}
        {block.ctaLabel && (
          <Link href={block.ctaHref || "/productos"} className="btn btn-outline mt-8">
            {block.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
