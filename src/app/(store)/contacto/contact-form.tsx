"use client";

import { useState } from "react";

const SUBJECTS = [
  "Consulta sobre un producto",
  "Estado de mi pedido",
  "Cambio o devolución",
  "Problema con un producto",
  "Compra para empresa",
  "Otro",
];

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("loading");

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No pudimos enviar tu mensaje.");
      setState("done");
      setMessage("¡Mensaje enviado! Te responderemos dentro de un día hábil.");
      form.reset();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "No pudimos enviar tu mensaje.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">
            Nombre
          </label>
          <input id="name" name="name" required minLength={2} className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">
            Correo
          </label>
          <input id="email" name="email" type="email" required className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">
            Teléfono (opcional)
          </label>
          <input id="phone" name="phone" type="tel" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="subject">
            Motivo
          </label>
          <select id="subject" name="subject" className="field" required defaultValue={SUBJECTS[0]}>
            {SUBJECTS.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="message">
          Mensaje
        </label>
        <textarea id="message" name="message" rows={6} required minLength={10} className="field" />
      </div>

      {/* Campo trampa invisible para bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {message && (
        <p className={`text-xs ${state === "error" ? "text-red-400" : "text-accent"}`}>{message}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="btn btn-primary w-full"
      >
        {state === "loading" ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
