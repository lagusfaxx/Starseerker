import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteShipping } from "@/lib/shipping";

export const runtime = "nodejs";

const schema = z.object({
  regionCode: z.string().min(1).max(4),
  subtotal: z.number().int().min(0).max(50_000_000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  try {
    const options = await quoteShipping(parsed.data.regionCode, parsed.data.subtotal);
    return NextResponse.json({ options });
  } catch (error) {
    console.error("[shipping/quote]", error);
    return NextResponse.json({ error: "No pudimos calcular el despacho." }, { status: 500 });
  }
}
