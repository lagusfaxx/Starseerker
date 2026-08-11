import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Somos el distribuidor oficial de STARSEEKER en Chile: importación directa, garantía local y servicio técnico en el país.",
};

const PILLARS = [
  {
    title: "Importación directa",
    text: "Trabajamos de la mano con la marca. Cada equipo que vendemos entra al país por canales formales, con documentación y respaldo.",
  },
  {
    title: "Garantía que se resuelve acá",
    text: "Nada de enviar tu equipo al extranjero. Tenemos repuestos y servicio técnico en Chile para resolver rápido.",
  },
  {
    title: "Precios en pesos, sin sorpresas",
    text: "Publicamos precios finales con IVA incluido y el costo de despacho se muestra antes de pagar, según tu región.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
          {settings.tagline}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
          Café de especialidad, sin fronteras
        </h1>
        <p className="mt-6 text-base leading-relaxed text-bone/80">
          STARSEEKER diseña molinos y máquinas de espresso portátiles pensadas para quienes no
          quieren renunciar a una buena extracción, estén donde estén. Nosotros trajimos esa
          propuesta a Chile con un compromiso simple: producto original, precio en pesos y soporte
          real cuando lo necesitas.
        </p>
        <p className="mt-4 text-base leading-relaxed text-bone/80">
          Somos un equipo chico y obsesivo con el café. Probamos cada equipo antes de listarlo,
          documentamos su ficha técnica en detalle y respondemos personalmente las consultas de
          soporte.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="card-surface p-5">
              <h2 className="text-sm font-bold">{pillar.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-mute">{pillar.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/productos"
            className="rounded-full bg-bone px-7 py-3 text-sm font-bold text-ink"
          >
            Ver la colección
          </Link>
          <Link
            href="/contacto"
            className="rounded-full border border-ink-line px-7 py-3 text-sm font-semibold hover:border-bone"
          >
            Hablar con el equipo
          </Link>
        </div>
      </div>
    </div>
  );
}
