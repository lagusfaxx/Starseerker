"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/components/cart-context";
import { formatCLP } from "@/lib/format";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const { items, isOpen, close, subtotal, setQuantity, remove, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
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
    <div className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <button
        aria-label="Cerrar carrito"
        onClick={close}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-ink-line bg-ink transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrito de compras"
      >
        <header className="flex h-16 items-center justify-between border-b border-ink-line px-5">
          <h2 className="eyebrow text-bone">
            Carrito {count > 0 && <span className="tnum text-mute">({count})</span>}
          </h2>
          <button onClick={close} className="link-quiet p-1" aria-label="Cerrar">
            <CloseIcon size={20} />
          </button>
        </header>

        {freeShippingThreshold !== null && items.length > 0 && (
          <div className="border-b border-ink-line px-5 py-4">
            <p className="text-xs text-mute">
              {missing > 0 ? (
                <>
                  Te faltan <strong className="tnum text-bone">{formatCLP(missing)}</strong> para
                  despacho gratis
                </>
              ) : (
                <strong className="text-bone">Tienes despacho gratis</strong>
              )}
            </p>
            <div className="mt-2 h-px w-full bg-ink-line">
              <div
                className="h-px bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <p className="text-sm text-mute">Todavía no agregaste productos.</p>
              <Link href="/productos" onClick={close} className="btn btn-primary btn-sm">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-line">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={close}
                    className="relative h-20 w-20 shrink-0 border border-ink-line bg-white"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1.5"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={close}
                      className="line-clamp-2 text-sm leading-snug font-medium hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="tnum mt-1 text-xs text-mute">{formatCLP(item.price)} c/u</p>

                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex items-center border border-ink-line">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="link-quiet px-2 py-1.5"
                          aria-label="Quitar una unidad"
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="tnum min-w-6 text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="link-quiet px-2 py-1.5 disabled:opacity-30"
                          aria-label="Agregar una unidad"
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="link-quiet p-1"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="tnum text-sm font-semibold whitespace-nowrap">
                    {formatCLP(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-ink-line px-5 py-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="tnum text-lg font-semibold">{formatCLP(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-mute">El despacho se calcula al finalizar la compra.</p>
            <Link href="/checkout" onClick={close} className="btn btn-primary mt-4 w-full">
              Finalizar compra
            </Link>
            <Link
              href="/carrito"
              onClick={close}
              className="link-quiet mt-3 block text-center text-xs"
            >
              Ver el carrito completo
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
