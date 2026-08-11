"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { REGIONS, comunasOf } from "@/lib/regions";
import { formatCLP } from "@/lib/format";
import type { ShippingOption } from "@/lib/shipping";

type CouponState = { code: string; discount: number; label: string; freeShipping: boolean } | null;

export function CheckoutClient({
  freeShippingThreshold,
  supportEmail,
}: {
  freeShippingThreshold: number | null;
  supportEmail: string;
}) {
  const { items, subtotal, ready } = useCart();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    rut: "",
    regionCode: "",
    comuna: "",
    addressLine: "",
    addressNumber: "",
    addressExtra: "",
    notes: "",
  });

  const [quote, setQuote] = useState<{ key: string; options: ShippingOption[] }>({
    key: "",
    options: [],
  });
  const [rateId, setRateId] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponState>(null);
  const [couponError, setCouponError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // La cotización se identifica por región + subtotal: mientras la clave no
  // coincida con la respuesta guardada, las opciones vigentes son ninguna.
  const quoteKey = form.regionCode && subtotal > 0 ? `${form.regionCode}:${subtotal}` : "";
  const options = quote.key === quoteKey && quoteKey !== "" ? quote.options : [];
  const loadingOptions = quoteKey !== "" && quote.key !== quoteKey;

  // Si el cliente aún no elige, se preselecciona la opción más barata.
  const selected = options.find((o) => o.id === rateId) ?? options[0] ?? null;
  const shippingCost = selected ? selected.price : 0;
  const discount = coupon ? (coupon.freeShipping ? shippingCost : coupon.discount) : 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  const comunas = useMemo(() => comunasOf(form.regionCode), [form.regionCode]);

  // Recotiza el despacho cada vez que cambia la región o el subtotal.
  useEffect(() => {
    if (!quoteKey) return;
    let cancelled = false;
    const [regionCode] = quoteKey.split(":");

    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regionCode, subtotal }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setQuote({ key: quoteKey, options: data.options ?? [] });
      })
      .catch(() => {
        if (!cancelled) setQuote({ key: quoteKey, options: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [quoteKey, subtotal]);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "regionCode" ? { comuna: "" } : {}),
    }));
  }

  async function applyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return;
    const res = await fetch("/api/cupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal, shippingCost }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setCoupon(null);
      setCouponError(data.error ?? "El código no es válido.");
      return;
    }
    setCoupon({
      code: data.code,
      discount: data.discount,
      label: data.label,
      freeShipping: data.freeShipping,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selected) {
      setError("Selecciona una forma de despacho.");
      return;
    }
    if (!selected.isPickup && (!form.addressLine || !form.comuna)) {
      setError("Completa la dirección de despacho.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shippingRateId: selected.id,
          couponCode: coupon?.code ?? null,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No pudimos crear tu pedido.");
      // El carrito se limpia en la página de resultado, después de confirmar el pago.
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear tu pedido.");
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="container-page py-24 text-center text-sm text-mute">Cargando…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">No hay productos para pagar</h1>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-bone px-7 py-3 text-sm font-bold text-ink"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-black tracking-tight">Finalizar compra</h1>
      <p className="mt-2 text-sm text-mute">
        Pago seguro con Mercado Pago. ¿Necesitas ayuda? Escríbenos a {supportEmail}.
      </p>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-sm font-bold tracking-[0.14em] uppercase">1 · Tus datos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" value={form.firstName} onChange={(v) => update("firstName", v)} required />
              <Field label="Apellido" value={form.lastName} onChange={(v) => update("lastName", v)} required />
              <Field
                label="Correo electrónico"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                required
              />
              <Field
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                required
              />
              <Field
                label="RUT (para boleta o factura)"
                placeholder="12.345.678-5"
                value={form.rut}
                onChange={(v) => update("rut", v)}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-[0.14em] uppercase">2 · Despacho</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Región</label>
                <select
                  className="field"
                  value={form.regionCode}
                  onChange={(e) => update("regionCode", e.target.value)}
                  required
                >
                  <option value="">Selecciona…</option>
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Comuna</label>
                <select
                  className="field"
                  value={form.comuna}
                  onChange={(e) => update("comuna", e.target.value)}
                  disabled={comunas.length === 0}
                  required={!selected?.isPickup}
                >
                  <option value="">Selecciona…</option>
                  {comunas.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Calle"
                value={form.addressLine}
                onChange={(v) => update("addressLine", v)}
                required={!selected?.isPickup}
              />
              <Field
                label="Número"
                value={form.addressNumber}
                onChange={(v) => update("addressNumber", v)}
                required={!selected?.isPickup}
              />
              <Field
                label="Depto / oficina (opcional)"
                value={form.addressExtra}
                onChange={(v) => update("addressExtra", v)}
              />
              <Field
                label="Notas para el repartidor (opcional)"
                value={form.notes}
                onChange={(v) => update("notes", v)}
              />
            </div>

            <div className="mt-6">
              <h3 className="field-label">Forma de envío</h3>
              {!form.regionCode && (
                <p className="text-xs text-mute">Selecciona tu región para ver las opciones.</p>
              )}
              {loadingOptions && <p className="text-xs text-mute">Calculando opciones…</p>}
              {form.regionCode && !loadingOptions && options.length === 0 && (
                <p className="rounded-xl border border-ink-line px-4 py-3 text-xs text-mute">
                  Aún no tenemos tarifa configurada para esta región. Escríbenos a {supportEmail} y
                  la cotizamos contigo.
                </p>
              )}
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                      selected?.id === option.id ? "border-accent bg-white/5" : "border-ink-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selected?.id === option.id}
                      onChange={() => setRateId(option.id)}
                      className="mt-1 accent-[#d7b56d]"
                    />
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                        {option.name}
                        <span className="whitespace-nowrap">
                          {option.price === 0 ? "Gratis" : formatCLP(option.price)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-mute">
                        {option.etaLabel}
                        {option.description ? ` · ${option.description}` : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="card-surface h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-sm font-bold tracking-[0.14em] uppercase">Tu pedido</h2>

          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  )}
                  <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-ink">
                    {item.quantity}
                  </span>
                </div>
                <p className="line-clamp-2 flex-1 text-xs">{item.name}</p>
                <p className="text-xs font-semibold whitespace-nowrap">
                  {formatCLP(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-ink-line pt-4">
            <label className="field-label">Código de descuento</label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="field flex-1 uppercase"
                placeholder="SS10"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-xl border border-ink-line px-4 text-xs font-semibold hover:border-bone"
              >
                Aplicar
              </button>
            </div>
            {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
            {coupon && <p className="mt-2 text-xs text-accent">{coupon.label} aplicado.</p>}
          </div>

          <dl className="mt-5 space-y-2 border-t border-ink-line pt-4 text-sm">
            <Row label="Subtotal" value={formatCLP(subtotal)} />
            <Row
              label="Despacho"
              value={
                !selected ? "Por calcular" : shippingCost === 0 ? "Gratis" : formatCLP(shippingCost)
              }
            />
            {discount > 0 && <Row label={`Descuento (${coupon?.code})`} value={`-${formatCLP(discount)}`} />}
            <div className="flex justify-between border-t border-ink-line pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatCLP(total)}</dd>
            </div>
          </dl>

          {freeShippingThreshold && subtotal < freeShippingThreshold && (
            <p className="mt-3 text-xs text-mute">
              Sobre {formatCLP(freeShippingThreshold)} el despacho es gratis.
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !selected}
            className="mt-5 w-full rounded-full bg-bone py-3.5 text-sm font-bold text-ink transition hover:bg-white disabled:opacity-50"
          >
            {submitting ? "Redirigiendo a Mercado Pago…" : "Pagar con Mercado Pago"}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-mute">
            Al pagar aceptas nuestros{" "}
            <Link href="/legal/terminos" className="underline">
              términos y condiciones
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-mute">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}
