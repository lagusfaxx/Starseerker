"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveSettings, type StoreSettings } from "@/lib/settings";
import { slugify } from "@/lib/format";
import { sendOrderShipped } from "@/lib/email";
import type { OrderStatus, DiscountType } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers de FormData
// ---------------------------------------------------------------------------

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function optionalStr(form: FormData, key: string): string | null {
  const value = str(form, key);
  return value === "" ? null : value;
}

function int(form: FormData, key: string, fallback = 0): number {
  const value = Number(String(form.get(key) ?? "").replace(/[^\d-]/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function optionalInt(form: FormData, key: string): number | null {
  const raw = String(form.get(key) ?? "").trim();
  if (raw === "") return null;
  const value = Number(raw.replace(/[^\d-]/g, ""));
  return Number.isFinite(value) ? value : null;
}

function bool(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

function optionalDate(form: FormData, key: string): Date | null {
  const raw = str(form, key);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Parsea un textarea de "Etiqueta: valor" por línea. */
function parsePairs(raw: string): { label: string; value: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(":");
      if (index === -1) return { label: line, value: "" };
      return { label: line.slice(0, index).trim(), value: line.slice(index + 1).trim() };
    })
    .filter((pair) => pair.label);
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

export async function saveProduct(formData: FormData) {
  await requireSession();

  const id = optionalStr(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const slug = slugify(str(formData, "slug") || name);
  const images = parseLines(str(formData, "images")).map((url, index) => ({
    url,
    alt: name,
    position: index,
  }));

  const data = {
    name,
    slug,
    subtitle: optionalStr(formData, "subtitle"),
    description: str(formData, "description"),
    price: int(formData, "price"),
    compareAtPrice: optionalInt(formData, "compareAtPrice"),
    sku: str(formData, "sku") || slug.toUpperCase().slice(0, 24),
    stock: int(formData, "stock"),
    weightGrams: int(formData, "weightGrams", 1000),
    active: bool(formData, "active"),
    featured: bool(formData, "featured"),
    isNew: bool(formData, "isNew"),
    bestSeller: bool(formData, "bestSeller"),
    specs: parsePairs(str(formData, "specs")),
    highlights: parseLines(str(formData, "highlights")),
    seoTitle: optionalStr(formData, "seoTitle"),
    seoDescription: optionalStr(formData, "seoDescription"),
    position: int(formData, "position"),
    categoryId: optionalStr(formData, "categoryId"),
  };

  if (id) {
    await prisma.$transaction([
      prisma.product.update({ where: { id }, data }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productImage.createMany({
        data: images.map((image) => ({ ...image, productId: id })),
      }),
    ]);
  } else {
    await prisma.product.create({
      data: { ...data, images: { create: images } },
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath(`/producto/${slug}`);
  redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function toggleProductActive(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  const product = await prisma.product.findUnique({ where: { id }, select: { active: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { active: !product.active } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------

export async function saveCategory(formData: FormData) {
  await requireSession();

  const id = optionalStr(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const data = {
    name,
    slug: slugify(str(formData, "slug") || name),
    description: optionalStr(formData, "description"),
    image: optionalStr(formData, "image"),
    position: int(formData, "position"),
    active: bool(formData, "active"),
  };

  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });

  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function deleteCategory(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Envíos
// ---------------------------------------------------------------------------

export async function saveZone(formData: FormData) {
  await requireSession();

  const id = optionalStr(formData, "id");
  const regionCodes = formData.getAll("regionCodes").map(String).filter(Boolean);

  const data = {
    name: str(formData, "name"),
    description: optionalStr(formData, "description"),
    regionCodes,
    active: bool(formData, "active"),
    position: int(formData, "position"),
  };

  if (!data.name) throw new Error("La zona necesita un nombre.");

  if (id) await prisma.shippingZone.update({ where: { id }, data });
  else await prisma.shippingZone.create({ data });

  revalidatePath("/admin/envios");
}

export async function deleteZone(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.shippingZone.delete({ where: { id } });
  revalidatePath("/admin/envios");
}

export async function saveRate(formData: FormData) {
  await requireSession();

  const id = optionalStr(formData, "id");
  const data = {
    zoneId: str(formData, "zoneId"),
    name: str(formData, "name"),
    description: optionalStr(formData, "description"),
    price: int(formData, "price"),
    freeOver: optionalInt(formData, "freeOver"),
    etaMinDays: int(formData, "etaMinDays", 1),
    etaMaxDays: int(formData, "etaMaxDays", 3),
    minSubtotal: int(formData, "minSubtotal"),
    maxSubtotal: optionalInt(formData, "maxSubtotal"),
    isPickup: bool(formData, "isPickup"),
    active: bool(formData, "active"),
    position: int(formData, "position"),
  };

  if (!data.zoneId || !data.name) throw new Error("Faltan datos de la tarifa.");

  if (id) await prisma.shippingRate.update({ where: { id }, data });
  else await prisma.shippingRate.create({ data });

  revalidatePath("/admin/envios");
}

export async function deleteRate(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.shippingRate.delete({ where: { id } });
  revalidatePath("/admin/envios");
}

// ---------------------------------------------------------------------------
// Cupones
// ---------------------------------------------------------------------------

export async function saveCoupon(formData: FormData) {
  await requireSession();

  const code = str(formData, "code").toUpperCase();
  if (!code) throw new Error("El código es obligatorio.");

  const data = {
    type: str(formData, "type") as DiscountType,
    value: int(formData, "value"),
    minSubtotal: int(formData, "minSubtotal"),
    maxUses: optionalInt(formData, "maxUses"),
    startsAt: optionalDate(formData, "startsAt"),
    expiresAt: optionalDate(formData, "expiresAt"),
    active: bool(formData, "active"),
  };

  await prisma.coupon.upsert({
    where: { code },
    create: { code, ...data },
    update: data,
  });

  revalidatePath("/admin/cupones");
}

export async function deleteCoupon(formData: FormData) {
  await requireSession();
  const code = str(formData, "code");
  if (!code) return;
  await prisma.coupon.delete({ where: { code } });
  revalidatePath("/admin/cupones");
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export async function updateOrder(formData: FormData) {
  const session = await requireSession();

  const id = str(formData, "id");
  const status = str(formData, "status") as OrderStatus;
  if (!id || !STATUSES.includes(status)) throw new Error("Datos inválidos.");

  const trackingCarrier = optionalStr(formData, "trackingCarrier");
  const trackingCode = optionalStr(formData, "trackingCode");
  const trackingUrl = optionalStr(formData, "trackingUrl");

  const current = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!current) throw new Error("Pedido no encontrado.");

  const becameShipped = status === "SHIPPED" && current.status !== "SHIPPED";

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      trackingCarrier,
      trackingCode,
      trackingUrl,
      shippedAt: becameShipped ? new Date() : current.shippedAt,
      events: {
        create: {
          type: "status_change",
          message: `${session.name} cambió el estado a "${status}".`,
        },
      },
    },
    include: { items: true },
  });

  // Avisamos al cliente solo cuando el pedido pasa a "en camino".
  if (becameShipped && bool(formData, "notify")) {
    await sendOrderShipped(order);
    await prisma.orderEvent.create({
      data: { orderId: order.id, type: "email", message: "Se envió el correo de despacho." },
    });
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function addOrderNote(formData: FormData) {
  const session = await requireSession();
  const orderId = str(formData, "orderId");
  const message = str(formData, "message");
  if (!orderId || !message) return;

  await prisma.orderEvent.create({
    data: { orderId, type: "note", message: `${session.name}: ${message}` },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
}

// ---------------------------------------------------------------------------
// Ajustes y mensajes
// ---------------------------------------------------------------------------

export async function updateSettings(formData: FormData) {
  await requireSession();

  const patch: Partial<StoreSettings> = {
    storeName: str(formData, "storeName"),
    logoUrl: str(formData, "logoUrl"),
    logoHeight: int(formData, "logoHeight", 28),
    tagline: str(formData, "tagline"),
    supportEmail: str(formData, "supportEmail"),
    salesEmail: str(formData, "salesEmail"),
    whatsapp: str(formData, "whatsapp"),
    phone: str(formData, "phone"),
    address: str(formData, "address"),
    instagram: str(formData, "instagram"),
    freeShippingThreshold: optionalInt(formData, "freeShippingThreshold"),
    heroVideoUrl: str(formData, "heroVideoUrl"),
    heroPosterUrl: str(formData, "heroPosterUrl"),
    heroTitle: str(formData, "heroTitle"),
    heroSubtitle: str(formData, "heroSubtitle"),
    heroCtaLabel: str(formData, "heroCtaLabel"),
    heroCtaHref: str(formData, "heroCtaHref"),
    announcement: str(formData, "announcement"),
    announcementActive: bool(formData, "announcementActive"),
    minOrderTotal: int(formData, "minOrderTotal", 1000),
  };

  await saveSettings(patch);
  revalidatePath("/", "layout");
  revalidatePath("/admin/ajustes");
}

export async function markMessageHandled(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return;
  await prisma.contactMessage.update({ where: { id }, data: { handled: !message.handled } });
  revalidatePath("/admin/mensajes");
}
