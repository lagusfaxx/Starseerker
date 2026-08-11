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
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionCode: code, subtotal }),
      });
      const data = await res.json();
      setOptions(res.ok ? data.options : []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-ink-line p-4">
      <label className="field-label">Calcula tu despacho</label>
      <select
        value={region}
        onChange={(e) => onChange(e.target.value)}
        className="field"
        aria-label="Región de despacho"
      >
        <option value="">Selecciona tu región…</option>
        {REGIONS.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>

      {loading && <p className="mt-3 text-xs text-mute">Calculando…</p>}

      {options && options.length === 0 && !loading && (
        <p className="mt-3 text-xs text-mute">
          Aún no tenemos tarifa configurada para esa región. Escríbenos y la cotizamos.
        </p>
      )}

      {options && options.length > 0 && (
        <ul className="mt-3 space-y-2 text-xs">
          {options.map((option) => (
            <li key={option.id} className="flex items-center justify-between gap-3">
              <span className="text-bone/85">
                {option.name} · <span className="text-mute">{option.etaLabel}</span>
              </span>
              <span className="font-semibold whitespace-nowrap">
                {option.price === 0 ? "Gratis" : formatCLP(option.price)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
