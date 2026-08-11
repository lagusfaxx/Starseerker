"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No pudimos suscribirte.");
      setState("done");
      setMessage("¡Listo! Revisa tu correo.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "No pudimos suscribirte.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          className="field sm:flex-1"
          aria-label="Correo electrónico"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-xl bg-bone px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-white disabled:opacity-60"
        >
          {state === "loading" ? "Enviando…" : "Suscribirme"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${state === "error" ? "text-red-400" : "text-accent"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
