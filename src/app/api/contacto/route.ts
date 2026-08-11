import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactMessage } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(90),
  email: z.string().email().max(160),
  phone: z.string().max(30).optional().nullable(),
  subject: z.string().min(2).max(120),
  message: z.string().min(10).max(3000),
  /** Campo trampa para bots: si viene con contenido, descartamos el envío. */
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del formulario." }, { status: 400 });
  }

  const { website, ...input } = parsed.data;
  if (website) return NextResponse.json({ ok: true });

  try {
    await prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone ?? null,
        subject: input.subject,
        message: input.message,
      },
    });
    void sendContactMessage(input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contacto]", error);
    return NextResponse.json({ error: "No pudimos enviar tu mensaje." }, { status: 500 });
  }
}
