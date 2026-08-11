import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { priceCart, applyCoupon } from "@/lib/cart";
import { resolveShippingRate } from "@/lib/shipping";
import { REGION_BY_CODE } from "@/lib/regions";
import { generateOrderNumber } from "@/lib/order-number";
import { createPreference } from "@/lib/mercadopago";
import { sendOrderReceived } from "@/lib/email";
import { normalizeRut } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(160),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().min(6).max(30),
  rut: z.string().max(20).optional().nullable(),
  regionCode: z.string().min(1).max(4),
  comuna: z.string().max(80).optional().nullable(),
  addressLine: z.string().max(160).optional().nullable(),
  addressNumber: z.string().max(30).optional().nullable(),
  addressExtra: z.string().max(120).optional().nullable(),
  notes: z.string().max(400).optional().nullable(),
  shippingRateId: z.string().min(1),
  couponCode: z.string().max(40).optional().nullable(),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(30),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del formulario." }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const region = REGION_BY_CODE.get(input.regionCode);
    if (!region) {
      return NextResponse.json({ error: "Región no válida." }, { status: 400 });
    }

    // 1. Precios y stock siempre se recalculan en el servidor.
    const cart = await priceCart(input.items);
    if (cart.lines.length === 0) {
      return NextResponse.json(
        { error: "Los productos de tu carrito ya no están disponibles." },
        { status: 400 },
      );
    }

    // 2. La tarifa de envío se revalida contra la configuración vigente.
    const rate = await resolveShippingRate(input.shippingRateId, input.regionCode, cart.subtotal);
    if (!rate) {
      return NextResponse.json(
        { error: "La forma de despacho seleccionada ya no está disponible." },
        { status: 400 },
      );
    }
    if (!rate.isPickup && (!input.addressLine || !input.comuna)) {
      return NextResponse.json({ error: "Falta la dirección de despacho." }, { status: 400 });
    }
    if (input.comuna && !region.comunas.includes(input.comuna)) {
      return NextResponse.json({ error: "La comuna no pertenece a la región." }, { status: 400 });
    }

    // 3. Cupón.
    let discount = 0;
    let couponCode: string | null = null;
    if (input.couponCode) {
      const result = await applyCoupon(input.couponCode, cart.subtotal, rate.price);
      if (result.ok) {
        discount = result.discount;
        couponCode = result.code;
      }
    }

    const settings = await getSettings();
    const total = Math.max(0, cart.subtotal + rate.price - discount);
    if (total < settings.minOrderTotal) {
      return NextResponse.json({ error: "El monto del pedido es demasiado bajo." }, { status: 400 });
    }

    const number = await generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        number,
        email: input.email.toLowerCase().trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        rut: input.rut ? (normalizeRut(input.rut) ?? input.rut.trim()) : null,
        regionCode: region.code,
        regionName: region.name,
        comuna: input.comuna ?? null,
        addressLine: input.addressLine ?? null,
        addressNumber: input.addressNumber ?? null,
        addressExtra: input.addressExtra ?? null,
        notes: input.notes ?? null,
        shippingRateId: rate.id,
        shippingMethod: rate.name,
        shippingEta: rate.etaLabel,
        subtotal: cart.subtotal,
        shippingCost: rate.price,
        discount,
        total,
        couponCode,
        items: {
          create: cart.lines.map((line) => ({
            productId: line.productId,
            name: line.name,
            sku: line.sku,
            image: line.image,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
          })),
        },
        events: {
          create: { type: "created", message: "Pedido creado desde el checkout." },
        },
      },
      include: { items: true },
    });

    // 4. Preferencia de pago. Si Mercado Pago falla, el pedido se descarta para
    // no dejar registros huérfanos que nunca podrán pagarse.
    let preference;
    try {
      preference = await createPreference(order);
    } catch (error) {
      console.error("[checkout] Mercado Pago rechazó la preferencia:", error);
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
      return NextResponse.json(
        { error: "No pudimos conectar con Mercado Pago. Intenta nuevamente en unos minutos." },
        { status: 502 },
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    // El correo no debe bloquear la redirección al pago.
    void sendOrderReceived(order);

    return NextResponse.json({
      orderNumber: order.number,
      token: order.publicToken,
      initPoint: preference.initPoint,
      issues: cart.issues,
    });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Intenta nuevamente en unos minutos." },
      { status: 500 },
    );
  }
}
