"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { formatCLP } from "@/lib/format";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";

export function CartPageClient({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const { items, subtotal, setQuantity, remove, ready, clear } = useCart();

  if (!ready) {
    return <div className="container-page py-24 text-center text-sm text-mute">Cargando…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-mute">Explora la colección y encuentra tu próximo equipo.</p>
        <Link
          href="/productos"
          className="mt-6 inline-block btn btn-primary"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  const missing = freeShippingThreshold ? Math.max(0, freeShippingThreshold - subtotal) : 0;

  return (
    <div className="container-page py-12">
      <h1 className="display text-3xl">Tu carrito</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-ink-line border-y border-ink-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link
                href={`/producto/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xs bg-white"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/producto/${item.slug}`} className="font-medium hover:text-accent">
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-mute">SKU {item.sku}</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center border border-ink-line">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="link-quiet px-3 py-1.5"
                      aria-label="Quitar una unidad"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span className="min-w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="link-quiet px-3 py-1.5 disabled:opacity-30"
                      aria-label="Agregar una unidad"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.productId)}
                    className="link-quiet inline-flex items-center gap-1.5 text-xs"
                  >
                    <TrashIcon size={14} />
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">{formatCLP(item.price * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="mt-1 text-xs text-mute">{formatCLP(item.price)} c/u</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <aside className="panel h-fit p-6 lg:sticky lg:top-28">
          <h2 className="eyebrow text-bone">Resumen</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd className="font-semibold">{formatCLP(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Despacho</dt>
              <dd className="text-mute">Se calcula en el checkout</dd>
            </div>
          </dl>

          {freeShippingThreshold && missing > 0 && (
            <p className="mt-4 rounded-xs border border-ink-line px-3 py-2 text-xs text-mute">
              Agrega <strong className="text-accent">{formatCLP(missing)}</strong> más y el despacho
              es gratis.
            </p>
          )}

          <Link
            href="/checkout"
            className="mt-6 block btn btn-primary w-full"
          >
            Continuar al pago
          </Link>
          <button
            onClick={clear}
            className="mt-3 w-full py-2 text-center text-xs text-mute underline underline-offset-4 hover:text-bone"
          >
            Vaciar carrito
          </button>
        </aside>
      </div>
    </div>
  );
}
