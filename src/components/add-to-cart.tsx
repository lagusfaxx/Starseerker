"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-context";
import { MinusIcon, PlusIcon } from "@/components/icons";

export function AddToCart({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const soldOut = item.maxStock <= 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center justify-between border border-ink-line sm:w-32">
        <button
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="link-quiet px-3 py-3.5"
          aria-label="Disminuir cantidad"
        >
          <MinusIcon size={16} />
        </button>
        <span className="tnum text-sm font-semibold">{quantity}</span>
        <button
          onClick={() => setQuantity((value) => Math.min(item.maxStock, value + 1))}
          disabled={quantity >= item.maxStock}
          className="link-quiet px-3 py-3.5 disabled:opacity-30"
          aria-label="Aumentar cantidad"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      <button
        disabled={soldOut}
        onClick={() => add(item, quantity)}
        className="btn btn-primary flex-1"
      >
        {soldOut ? "Producto agotado" : "Agregar al carrito"}
      </button>
    </div>
  );
}
