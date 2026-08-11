import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <CheckoutClient
      freeShippingThreshold={settings.freeShippingThreshold}
      supportEmail={settings.supportEmail}
    />
  );
}
