import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderSummary, StatusBadge } from "@/components/order-summary";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export const metadata: Metadata = { title: "Resultado del pago", robots: { index: false } };
export const dynamic = "force-dynamic";

const COPY: Record<string, { title: string; text: string }> = {
  PENDING: {
    title: "Estamos confirmando tu pago",
    text: "Mercado Pago aún no acredita el pago. Si pagaste con transferencia o efectivo puede tardar algunas horas; te avisaremos por correo apenas se confirme.",
  },
  IN_PROCESS: {
    title: "Tu pago está en revisión",
    text: "Mercado Pago está validando la transacción. Te escribiremos apenas tengamos el resultado.",
  },
  APPROVED: {
    title: "¡Gracias por tu compra!",
    text: "Tu pago fue aprobado y ya estamos preparando el pedido. Recibirás el seguimiento por correo.",
  },
  REJECTED: {
    title: "El pago fue rechazado",
    text: "Puedes intentar nuevamente con otro medio de pago. Tus productos siguen disponibles.",
  },
  CANCELLED: {
    title: "El pago fue cancelado",
    text: "No se realizó ningún cobro. Puedes volver a intentarlo cuando quieras.",
  },
  REFUNDED: {
    title: "Pago reembolsado",
    text: "El monto fue devuelto a tu medio de pago.",
  },
};

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { order: number, token } = await searchParams;
  if (!number || !token) notFound();

  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: true, events: { orderBy: { createdAt: "desc" } } },
  });

  if (!order || order.publicToken !== token) notFound();

  const copy = COPY[order.paymentStatus] ?? COPY.PENDING;
  const approved = order.paymentStatus === "APPROVED";

  return (
    <div className="container-page py-14">
      {approved && <ClearCartOnMount />}

      <div className="mx-auto max-w-3xl text-center">
        <StatusBadge status={order.status} />
        <h1 className="mt-4 display text-3xl sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-mute">{copy.text}</p>
        <p className="mt-4 text-sm">
          Pedido <strong>{order.number}</strong>
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/pedido/${order.number}?token=${order.publicToken}`}
            className="btn btn-primary"
          >
            Ver estado del pedido
          </Link>
          <Link
            href="/productos"
            className="btn btn-outline"
          >
            Seguir comprando
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <OrderSummary order={order} />
      </div>
    </div>
  );
}
