"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { isVideoUrl } from "@/lib/media";
import { discountPercent, formatCLP } from "@/lib/format";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  isNew: boolean;
  bestSeller: boolean;
  image: string | null;
  imageAlt: string | null;
};

export function ProductCard({
  product,
  className = "",
}: {
  product: ProductCardData;
  className?: string;
}) {
  const { add } = useCart();
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <article
      className={`group relative flex h-full flex-col border-r border-b border-ink-line bg-ink ${className}`}
    >
      <Link href={`/producto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-ink-soft">
        {product.image ? (
          isVideoUrl(product.image) ? (
            <video
              src={product.image}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={product.image}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 78vw"
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          )
        ) : (
          <div className="grid h-full place-items-center font-display text-xs tracking-[0.2em] text-mute uppercase">
            Sin imagen
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
          {product.isNew && <span className="badge bg-bone text-ink">Nuevo</span>}
          {off !== null && <span className="badge bg-bone text-ink">-{off}%</span>}
          {soldOut && <span className="badge bg-ink-raise text-bone">Agotado</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg leading-none transition-colors group-hover:text-mute">
          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.subtitle && (
          <p className="mt-2 line-clamp-1 text-[13px] tracking-wide text-mute uppercase">
            {product.subtitle}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-baseline gap-2.5">
            {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
              <span className="tnum text-sm text-mute line-through">
                {formatCLP(product.compareAtPrice)}
              </span>
            )}
            <span className="tnum font-display text-lg font-semibold">
              {formatCLP(product.price)}
            </span>
          </div>

          <button
            disabled={soldOut}
            onClick={() =>
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                price: product.price,
                image: product.image,
                maxStock: product.stock,
              })
            }
            className="btn btn-outline btn-sm mt-4 w-full"
          >
            {soldOut ? "Sin stock" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}
