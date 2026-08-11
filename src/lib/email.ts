import { Resend } from "resend";
import type { Order, OrderItem } from "@prisma/client";
import { formatCLP } from "@/lib/format";
import { siteUrl } from "@/lib/site";

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = () => process.env.RESEND_FROM ?? "STARSEEKER Chile <hola@starseerker.cl>";
const ADMIN_TO = () =>
  (process.env.ORDER_NOTIFICATION_EMAIL ?? "ventas@starseerker.cl")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

type SendArgs = { to: string | string[]; subject: string; html: string; replyTo?: string };

/** Envuelve el envío para que un fallo de correo nunca rompa un pago o un pedido. */
async function send({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  const client = resend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY ausente, se omite el envío:", subject);
    return false;
  }
  try {
    const { error } = await client.emails.send({
      from: FROM(),
      to,
      subject,
      html,
      replyTo,
    });
    if (error) {
      console.error("[email] Resend devolvió un error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Fallo al enviar:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Plantillas
// ---------------------------------------------------------------------------

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#0b0b0c;padding:32px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e9e9ea">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;background:#151517;border-radius:16px;overflow:hidden">
      <tr><td style="padding:28px 32px;border-bottom:1px solid #26262a">
        <div style="font-size:18px;font-weight:700;letter-spacing:.14em">STARSEEKER<span style="color:#8a8a90;font-weight:500"> CHILE</span></div>
      </td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${title}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #26262a;color:#8a8a90;font-size:12px;line-height:1.6">
        Distribuidor oficial STARSEEKER en Chile · <a href="${siteUrl()}" style="color:#9aa7ff">starseerker.cl</a><br/>
        ¿Dudas? Responde este correo y te contestamos.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function itemsTable(order: Order & { items: OrderItem[] }): string {
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #26262a">
          <div style="font-weight:600">${escapeHtml(item.name)}</div>
          <div style="color:#8a8a90;font-size:12px">SKU ${escapeHtml(item.sku)} · ${item.quantity} u.</div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #26262a;white-space:nowrap">
          ${formatCLP(item.unitPrice * item.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  const totalRow = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:6px 0;color:${strong ? "#e9e9ea" : "#8a8a90"};font-weight:${strong ? 700 : 400}">${label}</td>
     <td align="right" style="padding:6px 0;font-weight:${strong ? 700 : 400};white-space:nowrap">${value}</td></tr>`;

  return `<table role="presentation" width="100%" style="font-size:14px;margin:8px 0 20px">
    ${rows}
    ${totalRow("Subtotal", formatCLP(order.subtotal))}
    ${totalRow(`Despacho${order.shippingMethod ? ` (${escapeHtml(order.shippingMethod)})` : ""}`, order.shippingCost === 0 ? "Gratis" : formatCLP(order.shippingCost))}
    ${order.discount > 0 ? totalRow(`Descuento${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}`, `-${formatCLP(order.discount)}`) : ""}
    ${totalRow("Total", formatCLP(order.total), true)}
  </table>`;
}

function addressBlock(order: Order): string {
  if (!order.addressLine) return "";
  return `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
    <strong style="color:#e9e9ea">Despacho a</strong><br/>
    ${escapeHtml(order.addressLine)} ${escapeHtml(order.addressNumber ?? "")}${order.addressExtra ? `, ${escapeHtml(order.addressExtra)}` : ""}<br/>
    ${escapeHtml(order.comuna ?? "")}, ${escapeHtml(order.regionName ?? "")}<br/>
    ${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)} · ${escapeHtml(order.phone)}
  </p>`;
}

function trackUrl(order: Order): string {
  return `${siteUrl()}/pedido/${order.number}?token=${order.publicToken}`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#e9e9ea;color:#0b0b0c;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;font-size:14px">${label}</a>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Envíos
// ---------------------------------------------------------------------------

export async function sendOrderReceived(order: Order & { items: OrderItem[] }) {
  return send({
    to: order.email,
    subject: `Recibimos tu pedido ${order.number}`,
    html: layout(
      `Gracias por tu compra, ${escapeHtml(order.firstName)}`,
      `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
         Estamos esperando la confirmación de tu pago en Mercado Pago. Apenas se acredite
         te avisamos por correo y preparamos el despacho.
       </p>
       ${itemsTable(order)}
       ${addressBlock(order)}
       ${button(trackUrl(order), "Seguir mi pedido")}`,
    ),
  });
}

export async function sendPaymentApproved(order: Order & { items: OrderItem[] }) {
  await send({
    to: order.email,
    subject: `Pago confirmado — pedido ${order.number}`,
    html: layout(
      "¡Tu pago fue confirmado!",
      `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
         Ya estamos preparando tu pedido. Te enviaremos el número de seguimiento
         cuando salga de nuestra bodega.
       </p>
       ${itemsTable(order)}
       ${addressBlock(order)}
       ${button(trackUrl(order), "Ver estado del pedido")}`,
    ),
  });

  return send({
    to: ADMIN_TO(),
    subject: `Nueva venta ${order.number} — ${formatCLP(order.total)}`,
    replyTo: order.email,
    html: layout(
      `Venta confirmada ${escapeHtml(order.number)}`,
      `<p style="margin:0 0 12px;color:#b6b6ba;font-size:14px">
         ${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)} · ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}
       </p>
       ${itemsTable(order)}
       ${addressBlock(order)}
       ${button(`${siteUrl()}/admin/pedidos`, "Abrir en el panel")}`,
    ),
  });
}

export async function sendPaymentFailed(order: Order & { items: OrderItem[] }) {
  return send({
    to: order.email,
    subject: `No pudimos procesar el pago del pedido ${order.number}`,
    html: layout(
      "Tu pago no se completó",
      `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
         Mercado Pago rechazó el pago del pedido ${escapeHtml(order.number)}. Tus productos siguen
         reservados por 24 horas: puedes reintentar el pago con otro medio.
       </p>
       ${button(trackUrl(order), "Reintentar el pago")}`,
    ),
  });
}

export async function sendOrderShipped(order: Order & { items: OrderItem[] }) {
  const tracking = order.trackingCode
    ? `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
         <strong style="color:#e9e9ea">${escapeHtml(order.trackingCarrier ?? "Courier")}</strong><br/>
         Seguimiento: ${escapeHtml(order.trackingCode)}
         ${order.trackingUrl ? `<br/><a href="${order.trackingUrl}" style="color:#9aa7ff">Rastrear envío</a>` : ""}
       </p>`
    : "";

  return send({
    to: order.email,
    subject: `Tu pedido ${order.number} va en camino`,
    html: layout(
      "¡Tu pedido salió de bodega!",
      `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
         Despachamos tu pedido ${escapeHtml(order.number)}.
       </p>
       ${tracking}
       ${addressBlock(order)}
       ${button(trackUrl(order), "Ver mi pedido")}`,
    ),
  });
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  return send({
    to: ADMIN_TO(),
    replyTo: input.email,
    subject: `Contacto web: ${input.subject}`,
    html: layout(
      escapeHtml(input.subject),
      `<p style="margin:0 0 12px;color:#b6b6ba;font-size:14px">
        ${escapeHtml(input.name)} · ${escapeHtml(input.email)}${input.phone ? ` · ${escapeHtml(input.phone)}` : ""}
       </p>
       <p style="white-space:pre-wrap;color:#e9e9ea;font-size:14px;line-height:1.6">${escapeHtml(input.message)}</p>`,
    ),
  });
}

export async function sendWelcomeSubscriber(email: string) {
  return send({
    to: email,
    subject: "Bienvenido a STARSEEKER Chile",
    html: layout(
      "Gracias por suscribirte",
      `<p style="margin:0 0 20px;color:#b6b6ba;font-size:14px;line-height:1.6">
         Te avisaremos primero de los lanzamientos, restock y ofertas exclusivas
         del distribuidor oficial en Chile.
       </p>
       ${button(`${siteUrl()}/productos`, "Ver la colección")}`,
    ),
  });
}
