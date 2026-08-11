import type { Metadata } from "next";
import Link from "next/link";
import { HELP_PAGES } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { ChevronDownIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description:
    "Despachos, cambios, devoluciones y medios de pago de STARSEEKER Chile.",
};

const FAQ = [
  {
    q: "¿Son distribuidores oficiales?",
    a: "Sí. Somos el distribuidor oficial de STARSEEKER en Chile e importamos directamente desde la marca.",
  },
  {
    q: "¿Cuánto demora mi pedido?",
    a: "Entre 1 y 3 días hábiles en la Región Metropolitana y entre 2 y 7 días hábiles en regiones, contados desde que se acredita el pago.",
  },
  {
    q: "¿Puedo pagar en cuotas?",
    a: "Sí. Mercado Pago te permite pagar en cuotas con tarjeta de crédito según las condiciones de tu banco.",
  },
  {
    q: "¿Emiten factura?",
    a: "Sí. Indica tu RUT al pagar y escríbenos con los datos de tu empresa el mismo día de la compra.",
  },
  {
    q: "¿El producto es original?",
    a: "Sí. Todo el stock entra al país por canales formales, con su documentación de importación al día.",
  },
  {
    q: "¿Puedo cambiar un producto si no me gustó?",
    a: "Tienes 10 días corridos de retracto desde que recibes el producto, siempre que esté sin uso y en su embalaje original.",
  },
];

export default async function HelpPage() {
  const settings = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="container-page py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mx-auto max-w-3xl text-center">
        <h1 className="display text-3xl sm:text-4xl">Centro de ayuda</h1>
        <p className="mt-3 text-sm text-mute">
          Todo sobre despachos, pagos y devoluciones. ¿No encuentras lo que buscas?
          Escríbenos a{" "}
          <a href={`mailto:${settings.supportEmail}`} className="text-accent underline">
            {settings.supportEmail}
          </a>
          .
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {HELP_PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/ayuda/${page.slug}`}
            className="panel p-6 transition hover:border-bone/40"
          >
            <h2 className="text-base font-bold">{page.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-mute">{page.summary}</p>
          </Link>
        ))}
      </div>

      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y divide-ink-line border-y border-ink-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold">
                {item.q}
                <ChevronDownIcon size={17} className="shrink-0 text-mute transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-mute">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-12 max-w-3xl text-center">
        <Link
          href="/contacto"
          className="inline-block btn btn-primary"
        >
          Contactar al equipo
        </Link>
      </div>
    </div>
  );
}
