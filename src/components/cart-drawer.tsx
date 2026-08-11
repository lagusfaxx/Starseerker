"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/components/cart-context";
import { formatCLP } from "@/lib/format";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const { items, isOpen, close, subtotal, setQuantity, remove, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const missing = freeShippingThreshold ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const progress = freeShippingThreshold
    ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
    : 0;

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Cerrar carrito"
        onClick={close}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-ink-line bg-ink-soft transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrito de compras"
      >
        <header className="flex items-center justify-between border-b border-ink-line px-5 py-4">
          <h2 className="text-sm font-semibold tracking-[0.16em] uppercase">
            Carrito {count > 0 && <span className="text-mute">({count})</span>}
          </h2>
          <button onClick={close} className="text-mute hover:text-bone" aria-label="Cerrar">
            ✕
          </button>
        </header>

        {freeShippingThreshold && items.length > 0 && (
          <div className="border-b border-ink-line px-5 py-4">
            <p className="text-xs text-mute">
              {missing > 0 ? (
                <>
                  Te faltan <strong className="text-accent">{formatCLP(missing)}</strong> para
                  despacho gratis
                </>
              ) : (
                <strong className="text-accent">¡Tienes despacho gratis!</strong>
              )}
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink-line">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-mute">Tu carrito está vacío.</p>
              <Link
                href="/productos"
                onClick={close}
                className="rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-line">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={close}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/5"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={close}
                      className="line-clamp-2 text-sm font-medium hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-mute">{formatCLP(item.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-ink-line">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-mute hover:text-bone"
                          aria-label="Quitar una unidad"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2.5 py-1 text-mute hover:text-bone disabled:opacity-30"
                          aria-label="Agregar una unidad"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-xs text-mute underline underline-offset-4 hover:text-bone"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold whitespace-nowrap">
                    {formatCLP(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-ink-line px-5 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mute">Subtotal</span>
              <span className="text-lg font-semibold">{formatCLP(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-mute">El despacho se calcula en el checkout.</p>
            <Link
              href="/checkout"
              onClick={close}
              className="mt-4 block rounded-full bg-bone py-3 text-center text-sm font-bold text-ink transition hover:bg-white"
            >
              Ir a pagar
            </Link>
            <Link
              href="/carrito"
              onClick={close}
              className="mt-2 block py-2 text-center text-xs text-mute underline underline-offset-4 hover:text-bone"
            >
              Ver carrito completo
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
