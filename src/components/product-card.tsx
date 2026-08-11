"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
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

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <article className="group flex flex-col border-r border-b border-ink-line bg-ink-soft">
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-square overflow-hidden border-b border-ink-line bg-white"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-[11px] tracking-wider text-ink/30 uppercase">
            Sin imagen
          </div>
        )}

        <div className="absolute top-0 left-0 flex flex-col items-start">
          {off !== null && (
            <span className="bg-accent px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink">
              -{off}%
            </span>
          )}
          {product.isNew && off === null && (
            <span className="bg-ink px-2.5 py-1 text-[10px] font-bold tracking-wider text-bone">
              NUEVO
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-ink/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-bone">
              MÁS VENDIDO
            </span>
          )}
        </div>

        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/90 py-1.5 text-center text-[10px] font-bold tracking-[0.16em] text-bone">
            SIN STOCK
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow mb-1.5 text-[10px]">{product.sku}</p>
        <h3 className="text-sm leading-snug font-medium">
          <Link href={`/producto/${product.slug}`} className="transition group-hover:text-accent">
            {product.name}
          </Link>
        </h3>
        {product.subtitle && (
          <p className="mt-1 line-clamp-1 text-xs text-mute">{product.subtitle}</p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="tnum text-[17px] font-semibold">{formatCLP(product.price)}</span>
          {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
            <span className="tnum text-xs text-mute line-through">
              {formatCLP(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
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
            className="btn btn-outline btn-sm w-full"
          >
            {soldOut ? "Sin stock" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}
