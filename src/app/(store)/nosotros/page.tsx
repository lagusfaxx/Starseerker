import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Distribuidor oficial en Chile de STARSEEKER: molinos eléctricos, máquinas de espresso portátiles y accesorios. Importación directa y garantía local.",
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
        <h1 className="mt-4 display text-3xl sm:text-5xl">Equipos, no café</h1>
        <p className="mt-6 text-base leading-relaxed text-bone/80">
          STARSEEKER es una marca de equipamiento para café fundada en 2020: molinos eléctricos de
          sobremesa y portátiles, máquinas de espresso portátiles y accesorios como portafiltros,
          tampers y soportes. No vendemos café en grano: vendemos las herramientas con las que lo
          preparas.
        </p>
        <p className="mt-4 text-base leading-relaxed text-bone/80">
          Somos el distribuidor oficial de la marca en Chile. Importamos directo, publicamos precios
          en pesos con IVA incluido y respondemos por la garantía en el país.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="panel p-5">
              <h2 className="text-sm font-bold">{pillar.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-mute">{pillar.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/productos"
            className="btn btn-primary"
          >
            Ver la colección
          </Link>
          <Link
            href="/contacto"
            className="btn btn-outline"
          >
            Hablar con el equipo
          </Link>
        </div>
      </div>
    </div>
  );
}
