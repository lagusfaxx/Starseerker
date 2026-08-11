import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWelcomeSubscriber } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(160),
  source: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: true, alreadySubscribed: true });

    await prisma.subscriber.create({
      data: { email, source: parsed.data.source ?? "footer" },
    });
    void sendWelcomeSubscriber(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json({ error: "No pudimos suscribirte ahora." }, { status: 500 });
  }
}
