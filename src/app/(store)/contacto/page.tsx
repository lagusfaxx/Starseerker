import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos: soporte, garantía, cotizaciones y ventas corporativas en Chile.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-14">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Hablemos</h1>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            Respondemos de lunes a viernes, de 9:00 a 18:00 h. Para temas de garantía incluye tu
            número de pedido.
          </p>

          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="field-label">Soporte y garantía</dt>
              <dd>
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-accent">
                  {settings.supportEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="field-label">Ventas y empresas</dt>
              <dd>
                <a href={`mailto:${settings.salesEmail}`} className="hover:text-accent">
                  {settings.salesEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="field-label">WhatsApp</dt>
              <dd>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent"
                >
                  {settings.whatsapp}
                </a>
              </dd>
            </div>
            <div>
              <dt className="field-label">Dirección</dt>
              <dd className="text-bone/80">{settings.address}</dd>
            </div>
          </dl>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
