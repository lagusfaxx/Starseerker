import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { Order, OrderItem } from "@prisma/client";
import { siteUrl } from "@/lib/site";

function client(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_ACCESS_TOKEN no está configurado.");
  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10_000 },
  });
}

export type PreferenceResult = { id: string; initPoint: string };

/**
 * Crea una preferencia de Checkout Pro para un pedido ya persistido.
 * Los montos van en CLP sin decimales (moneda sin centavos).
 */
export async function createPreference(
  order: Order & { items: OrderItem[] },
): Promise<PreferenceResult> {
  const preference = new Preference(client());
  const base = siteUrl();

  const items = order.items.map((item) => ({
    id: item.sku,
    title: item.name.slice(0, 250),
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "CLP",
    picture_url: item.image ?? undefined,
  }));

  if (order.shippingCost > 0) {
    items.push({
      id: "ENVIO",
      title: `Despacho — ${order.shippingMethod ?? "Envío"}`,
      quantity: 1,
      unit_price: order.shippingCost,
      currency_id: "CLP",
      picture_url: undefined,
    });
  }

  // Mercado Pago no admite ítems con monto negativo, así que cuando hay un
  // cupón el detalle se colapsa en una sola línea por el total real del pedido.
  const body =
    order.discount > 0
      ? [
          {
            id: order.number,
            title: `Pedido ${order.number} — ${order.items.length} producto(s)`,
            quantity: 1,
            unit_price: order.total,
            currency_id: "CLP",
            picture_url: order.items[0]?.image ?? undefined,
          },
        ]
      : items;

  const response = await preference.create({
    body: {
      items: body,
      external_reference: order.number,
      statement_descriptor: "STARSEEKER",
      payer: {
        name: order.firstName,
        surname: order.lastName,
        email: order.email,
        phone: { number: order.phone },
      },
      back_urls: {
        success: `${base}/checkout/resultado?order=${order.number}&token=${order.publicToken}`,
        pending: `${base}/checkout/resultado?order=${order.number}&token=${order.publicToken}`,
        failure: `${base}/checkout/resultado?order=${order.number}&token=${order.publicToken}`,
      },
      auto_return: "approved",
      notification_url: `${base}/api/webhooks/mercadopago`,
      metadata: { order_id: order.id, order_number: order.number },
    },
  });

  if (!response.id || !response.init_point) {
    throw new Error("Mercado Pago no devolvió una preferencia válida.");
  }

  return { id: response.id, initPoint: response.init_point };
}

export type MpPayment = {
  id: string;
  status: string;
  statusDetail: string | null;
  externalReference: string | null;
  amount: number | null;
};

export async function getPayment(paymentId: string): Promise<MpPayment | null> {
  const payment = new Payment(client());
  const result = await payment.get({ id: paymentId });
  if (!result?.id) return null;
  return {
    id: String(result.id),
    status: String(result.status ?? "pending"),
    statusDetail: result.status_detail ?? null,
    externalReference: result.external_reference ?? null,
    amount: result.transaction_amount ?? null,
  };
}

/** Traduce el estado de Mercado Pago al enum interno. */
export function mapPaymentStatus(status: string) {
  switch (status) {
    case "approved":
      return "APPROVED" as const;
    case "in_process":
    case "authorized":
      return "IN_PROCESS" as const;
    case "rejected":
      return "REJECTED" as const;
    case "refunded":
    case "charged_back":
      return "REFUNDED" as const;
    case "cancelled":
      return "CANCELLED" as const;
    default:
      return "PENDING" as const;
  }
}
