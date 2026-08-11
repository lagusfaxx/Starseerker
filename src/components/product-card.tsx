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
    <article className="group flex h-full flex-col rounded-xl bg-ink-soft p-4 text-center transition duration-300 hover:bg-ink-raise sm:p-5">
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-lg bg-black"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[11px] tracking-[0.2em] text-mute uppercase">
            Sin imagen
          </div>
        )}

        {off !== null && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
            -{off}%
          </span>
        )}
        {off === null && product.isNew && (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-black">
            NUEVO
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-black/80 py-2 text-[10px] font-semibold tracking-[0.18em] text-white">
            AGOTADO
          </span>
        )}
      </Link>

      <h3 className="mt-5 text-[15px] font-semibold">
        <Link href={`/producto/${product.slug}`} className="transition hover:text-accent">
          {product.name}
        </Link>
      </h3>

      <p className="tnum mt-2 text-[15px] font-semibold">
        {formatCLP(product.price)}
        {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
          <span className="ml-2 text-xs font-normal text-mute line-through">
            {formatCLP(product.compareAtPrice)}
          </span>
        )}
      </p>

      {product.subtitle && (
        <p className="mt-2 line-clamp-1 text-xs text-mute">{product.subtitle}</p>
      )}

      <div className="mt-auto pt-5">
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
          className="btn btn-primary btn-sm"
        >
          {soldOut ? "Sin stock" : "Comprar ahora"}
        </button>
      </div>
    </article>
  );
}
