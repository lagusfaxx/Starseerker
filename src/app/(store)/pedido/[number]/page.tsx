import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderSummary, StatusBadge } from "@/components/order-summary";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tu pedido", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ number }, { token }] = await Promise.all([params, searchParams]);

  const order = await prisma.order.findUnique({
    where: { number: number.toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: "desc" } } },
  });

  // El token público hace las veces de contraseña del pedido.
  if (!order || !token || order.publicToken !== token) notFound();

  return (
    <div className="container-page py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Pedido {order.number}</h1>
          <p className="mt-1 text-sm text-mute">Creado el {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-10">
        <OrderSummary order={order} />
      </div>
    </div>
  );
}
