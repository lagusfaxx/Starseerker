import Image from "next/image";
import type { Order, OrderItem, OrderEvent } from "@prisma/client";
import { formatCLP, formatDateTime } from "@/lib/format";

export const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING: "Esperando pago",
  PAID: "Pago confirmado",
  PREPARING: "Preparando pedido",
  SHIPPED: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const STATUS_TONE: Record<Order["status"], string> = {
  PENDING: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  PAID: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  PREPARING: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  SHIPPED: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-300 border-red-500/30",
  REFUNDED: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
};

export function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${STATUS_TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function OrderSummary({
  order,
}: {
  order: Order & { items: OrderItem[]; events?: OrderEvent[] };
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="panel p-6">
        <h2 className="eyebrow text-bone">Productos</h2>
        <ul className="mt-4 divide-y divide-ink-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xs bg-white">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="mt-1 text-xs text-mute">
                  SKU {item.sku} · {item.quantity} × {formatCLP(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-semibold whitespace-nowrap">
                {formatCLP(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-ink-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-mute">Subtotal</dt>
            <dd>{formatCLP(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mute">Despacho {order.shippingMethod && `(${order.shippingMethod})`}</dt>
            <dd>{order.shippingCost === 0 ? "Gratis" : formatCLP(order.shippingCost)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-mute">Descuento {order.couponCode && `(${order.couponCode})`}</dt>
              <dd>-{formatCLP(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-line pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatCLP(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-6">
        <div className="panel p-6">
          <h2 className="eyebrow text-bone">Despacho</h2>
          <p className="mt-3 text-sm leading-relaxed text-bone/85">
            {order.firstName} {order.lastName}
            <br />
            {order.addressLine ? (
              <>
                {order.addressLine} {order.addressNumber}
                {order.addressExtra ? `, ${order.addressExtra}` : ""}
                <br />
                {order.comuna}, {order.regionName}
                <br />
              </>
            ) : (
              <>Retiro en tienda</>
            )}
            {order.phone}
          </p>
          {order.shippingEta && (
            <p className="mt-3 text-xs text-mute">Plazo estimado: {order.shippingEta}</p>
          )}
          {order.trackingCode && (
            <div className="mt-4 rounded-xs border border-ink-line px-3 py-2 text-xs">
              <p className="font-semibold">{order.trackingCarrier ?? "Courier"}</p>
              <p className="text-mute">Seguimiento: {order.trackingCode}</p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-accent underline"
                >
                  Rastrear envío
                </a>
              )}
            </div>
          )}
        </div>

        {order.events && order.events.length > 0 && (
          <div className="panel p-6">
            <h2 className="eyebrow text-bone">Historial</h2>
            <ol className="mt-4 space-y-3 text-xs">
              {order.events.map((event) => (
                <li key={event.id} className="border-l border-ink-line pl-3">
                  <p className="text-bone/85">{event.message}</p>
                  <p className="mt-0.5 text-mute">{formatDateTime(event.createdAt)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
