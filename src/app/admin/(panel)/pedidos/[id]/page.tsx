import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderSummary, StatusBadge, STATUS_LABEL } from "@/components/order-summary";
import { addOrderNote, updateOrder } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/pedidos" className="text-xs text-mute hover:text-bone">
        ← Volver a pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.number}</h1>
          <p className="mt-1 text-xs text-mute">
            {formatDateTime(order.createdAt)} · {order.email} · {order.phone}
            {order.rut ? ` · RUT ${order.rut}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <Link
            href={`/pedido/${order.number}?token=${order.publicToken}`}
            target="_blank"
            className="text-xs text-mute hover:text-bone"
          >
            Ver como cliente ↗
          </Link>
        </div>
      </div>

      <div className="card-surface mt-6 p-5">
        <h2 className="text-sm font-bold">Gestión</h2>
        <form action={updateOrder} className="mt-4 grid gap-4 lg:grid-cols-5">
          <input type="hidden" name="id" value={order.id} />
          <div>
            <label className="field-label">Estado</label>
            <select name="status" defaultValue={order.status} className="field">
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Courier</label>
            <input
              name="trackingCarrier"
              defaultValue={order.trackingCarrier ?? ""}
              placeholder="Starken, Chilexpress…"
              className="field"
            />
          </div>
          <div>
            <label className="field-label">N° seguimiento</label>
            <input name="trackingCode" defaultValue={order.trackingCode ?? ""} className="field" />
          </div>
          <div>
            <label className="field-label">URL de seguimiento</label>
            <input name="trackingUrl" defaultValue={order.trackingUrl ?? ""} className="field" />
          </div>
          <div className="flex flex-col justify-end gap-3">
            <label className="flex items-center gap-2 text-xs text-mute">
              <input
                type="checkbox"
                name="notify"
                defaultChecked
                className="h-4 w-4 accent-[#d7b56d]"
              />
              Avisar por correo al despachar
            </label>
            <button className="rounded-full bg-bone py-2.5 text-sm font-bold text-ink">
              Guardar
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-ink-line pt-4 text-xs text-mute">
          <p>
            Pago: {order.paymentStatus}
            {order.mpPaymentId ? ` · ID Mercado Pago ${order.mpPaymentId}` : ""}
            {order.mpStatusDetail ? ` · ${order.mpStatusDetail}` : ""}
          </p>
          {order.notes && <p className="mt-1">Nota del cliente: {order.notes}</p>}
        </div>
      </div>

      <div className="mt-8">
        <OrderSummary order={order} />
      </div>

      <div className="card-surface mt-6 p-5">
        <h2 className="text-sm font-bold">Nota interna</h2>
        <form action={addOrderNote} className="mt-3 flex gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <input
            name="message"
            placeholder="Ej: cliente pidió cambiar la dirección"
            className="field flex-1"
            required
          />
          <button className="rounded-xl border border-ink-line px-5 text-xs font-semibold hover:border-bone">
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
