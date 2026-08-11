"use client";

import { useState } from "react";
import { REGIONS } from "@/lib/regions";
import { formatCLP } from "@/lib/format";
import type { ShippingOption } from "@/lib/shipping";

/** Calculadora de despacho por región para la ficha de producto. */
export function ShippingEstimator({ subtotal }: { subtotal: number }) {
  const [region, setRegion] = useState("");
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function onChange(code: string) {
    setRegion(code);
    setOptions(null);
    if (!code) return;
    setLoading(true);
    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionCode: code, subtotal }),
      });
      const data = await response.json();
      setOptions(response.ok ? data.options : []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-ink-line p-4">
      <label className="field-label" htmlFor="estimador-region">
        Calcular despacho
      </label>
      <select
        id="estimador-region"
        value={region}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      >
        <option value="">Selecciona tu región</option>
        {REGIONS.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>

      {loading && <p className="mt-3 text-xs text-mute">Calculando…</p>}

      {options && options.length === 0 && !loading && (
        <p className="mt-3 text-xs text-mute">
          Todavía no hay tarifa configurada para esa región. Escríbenos y la cotizamos.
        </p>
      )}

      {options && options.length > 0 && (
        <table className="mt-3 w-full text-xs">
          <tbody className="divide-y divide-ink-line">
            {options.map((option) => (
              <tr key={option.id}>
                <td className="py-2 pr-3">
                  <span className="text-bone/85">{option.name}</span>
                  <span className="block text-mute">{option.etaLabel}</span>
                </td>
                <td className="tnum py-2 text-right font-semibold whitespace-nowrap">
                  {option.price === 0 ? "Gratis" : formatCLP(option.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
