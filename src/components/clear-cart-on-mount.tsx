"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-context";

/** Vacía el carrito una vez que el pago quedó confirmado. */
export function ClearCartOnMount() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);

  return null;
}
