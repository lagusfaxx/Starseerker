import { NextResponse } from "next/server";
import { z } from "zod";
import { applyCoupon } from "@/lib/cart";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().int().min(0),
  shippingCost: z.number().int().min(0).default(0),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
  }

  try {
    const result = await applyCoupon(
      parsed.data.code,
      parsed.data.subtotal,
      parsed.data.shippingCost,
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("[cupon]", error);
    return NextResponse.json({ ok: false, error: "No pudimos validar el código." }, { status: 500 });
  }
}
