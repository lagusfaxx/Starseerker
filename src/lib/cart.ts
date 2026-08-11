import { prisma } from "@/lib/prisma";

export type CartLineInput = { productId: string; quantity: number };

export type PricedLine = {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
};

export type CartPricing = {
  lines: PricedLine[];
  subtotal: number;
  /** Problemas de stock o productos inactivos detectados al revalidar. */
  issues: string[];
};

/**
 * Revalida el carrito contra la base de datos. Nunca se confía en los precios
 * que llegan desde el navegador: siempre se recalculan aquí.
 */
export async function priceCart(input: CartLineInput[]): Promise<CartPricing> {
  const cleaned = input
    .filter((l) => l.productId && Number.isFinite(l.quantity) && l.quantity > 0)
    .map((l) => ({ productId: l.productId, quantity: Math.min(Math.floor(l.quantity), 20) }));

  if (cleaned.length === 0) return { lines: [], subtotal: 0, issues: [] };

  const products = await prisma.product.findMany({
    where: { id: { in: cleaned.map((l) => l.productId) } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: PricedLine[] = [];
  const issues: string[] = [];

  for (const line of cleaned) {
    const product = byId.get(line.productId);
    if (!product || !product.active) {
      issues.push("Un producto de tu carrito ya no está disponible y fue removido.");
      continue;
    }
    if (product.stock <= 0) {
      issues.push(`${product.name} está sin stock y fue removido del carrito.`);
      continue;
    }
    const quantity = Math.min(line.quantity, product.stock);
    if (quantity < line.quantity) {
      issues.push(`Solo quedan ${product.stock} unidades de ${product.name}.`);
    }
    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images[0]?.url ?? null,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
      stock: product.stock,
    });
  }

  return {
    lines,
    subtotal: lines.reduce((acc, l) => acc + l.lineTotal, 0),
    issues,
  };
}

export type CouponResult =
  | { ok: true; code: string; discount: number; freeShipping: boolean; label: string }
  | { ok: false; error: string };

export async function applyCoupon(
  rawCode: string,
  subtotal: number,
  shippingCost: number,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Ingresa un código." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { ok: false, error: "El código no es válido." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "El código aún no está vigente." };
  if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, error: "El código está vencido." };
  if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) {
    return { ok: false, error: "El código alcanzó su límite de usos." };
  }
  if (subtotal < coupon.minSubtotal) {
    return { ok: false, error: "Tu compra no alcanza el mínimo de este código." };
  }

  if (coupon.type === "FREE_SHIPPING") {
    return {
      ok: true,
      code,
      discount: shippingCost,
      freeShipping: true,
      label: "Envío gratis",
    };
  }

  const discount =
    coupon.type === "PERCENT"
      ? Math.round((subtotal * Math.min(coupon.value, 100)) / 100)
      : Math.min(coupon.value, subtotal);

  return {
    ok: true,
    code,
    discount,
    freeShipping: false,
    label: coupon.type === "PERCENT" ? `${coupon.value}% de descuento` : "Descuento",
  };
}
