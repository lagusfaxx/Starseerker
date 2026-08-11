import type { Metadata } from "next";
import { CartPageClient } from "./cart-client";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Tu carrito", robots: { index: false } };

export default async function CartPage() {
  const settings = await getSettings();
  return <CartPageClient freeShippingThreshold={settings.freeShippingThreshold} />;
}
