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
    <article className="group relative flex flex-col">
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-white"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-ink/40">Sin imagen</div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {off && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-ink">
              -{off}%
            </span>
          )}
          {product.isNew && !off && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-bone">
              NUEVO
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold text-bone">
              TOP VENTAS
            </span>
          )}
        </div>

        {soldOut && (
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/85 px-3 py-1 text-[10px] font-bold text-bone">
            AGOTADO
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link
          href={`/producto/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold transition group-hover:text-accent"
        >
          {product.name}
        </Link>
        {product.subtitle && (
          <p className="mt-1 line-clamp-1 text-xs text-mute">{product.subtitle}</p>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">{formatCLP(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-mute line-through">
              {formatCLP(product.compareAtPrice)}
            </span>
          )}
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
          className="mt-3 rounded-full border border-ink-line py-2.5 text-xs font-bold tracking-wide transition hover:border-bone hover:bg-bone hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-bone"
        >
          {soldOut ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}
