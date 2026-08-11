import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getPayment, mapPaymentStatus } from "@/lib/mercadopago";
import { sendPaymentApproved, sendPaymentFailed } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Valida la firma `x-signature` de Mercado Pago.
 * Si no hay secreto configurado se omite (útil en desarrollo).
 */
function verifySignature(request: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => part.split("=").map((s) => s.trim()) as [string, string]),
  );
  const ts = parts.ts;
  const hash = parts.v1;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${requestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    /* Mercado Pago a veces notifica solo por query string. */
  }

  const url = new URL(request.url);
  const type = String(body.type ?? body.topic ?? url.searchParams.get("type") ?? "");
  const dataId = String(
    (body.data as { id?: string | number } | undefined)?.id ??
      url.searchParams.get("data.id") ??
      url.searchParams.get("id") ??
      "",
  );

  if (type !== "payment" || !dataId) {
    // Otros topics (merchant_order, etc.) se confirman sin procesar.
    return NextResponse.json({ received: true });
  }

  if (!verifySignature(request, dataId)) {
    console.warn("[mp-webhook] Firma inválida para el pago", dataId);
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  try {
    const payment = await getPayment(dataId);
    if (!payment?.externalReference) {
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: { number: payment.externalReference },
      include: { items: true },
    });
    if (!order) {
      console.warn("[mp-webhook] Pedido no encontrado:", payment.externalReference);
      return NextResponse.json({ received: true });
    }

    const paymentStatus = mapPaymentStatus(payment.status);

    // Idempotencia: si ya procesamos este pago con el mismo estado, no repetimos nada.
    if (order.mpPaymentId === payment.id && order.paymentStatus === paymentStatus) {
      return NextResponse.json({ received: true, duplicated: true });
    }

    const wasApproved = order.paymentStatus === "APPROVED";
    const isApproved = paymentStatus === "APPROVED";

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        mpPaymentId: payment.id,
        mpStatusDetail: payment.statusDetail,
        paymentStatus,
        paidAt: isApproved ? (order.paidAt ?? new Date()) : order.paidAt,
        status: isApproved
          ? order.status === "PENDING"
            ? "PAID"
            : order.status
          : paymentStatus === "REJECTED" || paymentStatus === "CANCELLED"
            ? "CANCELLED"
            : order.status,
        events: {
          create: {
            type: `payment_${payment.status}`,
            message: `Mercado Pago informó el estado "${payment.status}".`,
            meta: { paymentId: payment.id, statusDetail: payment.statusDetail },
          },
        },
      },
      include: { items: true },
    });

    if (isApproved && !wasApproved) {
      // Descuento de stock y uso del cupón, una sola vez por pedido.
      await prisma.$transaction([
        ...updated.items
          .filter((item) => item.productId)
          .map((item) =>
            prisma.product.update({
              where: { id: item.productId! },
              data: { stock: { decrement: item.quantity } },
            }),
          ),
        ...(updated.couponCode
          ? [
              prisma.coupon.update({
                where: { code: updated.couponCode },
                data: { uses: { increment: 1 } },
              }),
            ]
          : []),
      ]);
      await sendPaymentApproved(updated);
    }

    if ((paymentStatus === "REJECTED" || paymentStatus === "CANCELLED") && !wasApproved) {
      await sendPaymentFailed(updated);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[mp-webhook]", error);
    // Devolvemos 500 para que Mercado Pago reintente la notificación.
    return NextResponse.json({ error: "Error procesando la notificación" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
