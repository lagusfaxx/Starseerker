import { prisma } from "@/lib/prisma";

/**
 * Genera un número de pedido legible (SS-2608-4821) verificando que no exista.
 */
export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (let attempt = 0; attempt < 8; attempt++) {
    const random = String(Math.floor(1000 + Math.random() * 9000));
    const candidate = `SS-${stamp}-${random}`;
    const exists = await prisma.order.findUnique({
      where: { number: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return `SS-${stamp}-${Date.now().toString().slice(-6)}`;
}
