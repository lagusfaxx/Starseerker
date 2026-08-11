"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-context";

export function AddToCart({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const soldOut = item.maxStock <= 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center justify-between rounded-full border border-ink-line px-2 sm:w-36">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-3 text-mute hover:text-bone"
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="text-sm font-semibold">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(item.maxStock, q + 1))}
          disabled={quantity >= item.maxStock}
          className="px-3 py-3 text-mute hover:text-bone disabled:opacity-30"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <button
        disabled={soldOut}
        onClick={() => add(item, quantity)}
        className="flex-1 rounded-full bg-bone py-3.5 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {soldOut ? "Producto agotado" : "Agregar al carrito"}
      </button>
    </div>
  );
}
