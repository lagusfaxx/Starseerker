import { prisma } from "@/lib/prisma";
import { REGION_BY_CODE } from "@/lib/regions";

export type ShippingOption = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isFree: boolean;
  isPickup: boolean;
  etaMinDays: number;
  etaMaxDays: number;
  etaLabel: string;
  zoneName: string;
};

function etaLabel(min: number, max: number): string {
  if (min === max) return min === 1 ? "1 día hábil" : `${min} días hábiles`;
  return `${min} a ${max} días hábiles`;
}

/**
 * Devuelve las opciones de despacho disponibles para una región,
 * aplicando umbral de envío gratis y rangos de subtotal.
 */
export async function quoteShipping(
  regionCode: string,
  subtotal: number,
): Promise<ShippingOption[]> {
  if (!REGION_BY_CODE.has(regionCode)) return [];

  const zones = await prisma.shippingZone.findMany({
    where: { active: true, regionCodes: { has: regionCode } },
    include: {
      rates: { where: { active: true }, orderBy: [{ position: "asc" }, { price: "asc" }] },
    },
    orderBy: { position: "asc" },
  });

  const options: ShippingOption[] = [];
  for (const zone of zones) {
    for (const rate of zone.rates) {
      if (subtotal < rate.minSubtotal) continue;
      if (rate.maxSubtotal != null && subtotal > rate.maxSubtotal) continue;
      const isFree = rate.freeOver != null && subtotal >= rate.freeOver;
      options.push({
        id: rate.id,
        name: rate.name,
        description: rate.description,
        price: isFree ? 0 : rate.price,
        isFree,
        isPickup: rate.isPickup,
        etaMinDays: rate.etaMinDays,
        etaMaxDays: rate.etaMaxDays,
        etaLabel: etaLabel(rate.etaMinDays, rate.etaMaxDays),
        zoneName: zone.name,
      });
    }
  }

  return options.sort((a, b) => a.price - b.price || a.etaMaxDays - b.etaMaxDays);
}

/** Valida que una tarifa elegida por el cliente siga siendo válida en el servidor. */
export async function resolveShippingRate(
  rateId: string,
  regionCode: string,
  subtotal: number,
): Promise<ShippingOption | null> {
  const options = await quoteShipping(regionCode, subtotal);
  return options.find((o) => o.id === rateId) ?? null;
}
