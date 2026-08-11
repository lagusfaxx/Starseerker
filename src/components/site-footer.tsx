import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { Logo } from "@/components/logo";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import type { StoreSettings } from "@/lib/settings";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Tienda",
    links: [
      { label: "Todos los productos", href: "/productos" },
      { label: "Molinos", href: "/coleccion/molinos" },
      { label: "Máquinas de espresso", href: "/coleccion/maquinas-espresso" },
      { label: "Accesorios", href: "/coleccion/accesorios" },
      { label: "Ofertas", href: "/productos?filtro=ofertas" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Centro de ayuda", href: "/ayuda" },
      { label: "Despachos y plazos", href: "/ayuda/despachos" },
      { label: "Cambios y devoluciones", href: "/ayuda/devoluciones" },
      { label: "Garantía oficial", href: "/ayuda/garantia" },
      { label: "Medios de pago", href: "/ayuda/pagos" },
      { label: "Seguimiento de pedido", href: "/pedido" },
    ],
  },
  {
    title: "La empresa",
    links: [
      { label: "Quiénes somos", href: "/nosotros" },
      { label: "Contacto", href: "/contacto" },
      { label: "Términos y condiciones", href: "/legal/terminos" },
      { label: "Política de privacidad", href: "/legal/privacidad" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-24 border-t border-ink-line">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-8">
        <div className="max-w-sm">
          <Logo
            logoUrl={settings.logoUrl}
            logoHeight={settings.logoHeight}
            storeName={settings.storeName}
          />
          <p className="mt-4 text-sm leading-relaxed text-mute">
            {settings.tagline}. Importación directa, boleta o factura electrónica y garantía
            respaldada en Chile.
          </p>

          <ul className="mt-6 space-y-2.5 text-sm text-mute">
            <li className="flex items-start gap-2.5">
              <MailIcon size={16} className="mt-0.5 shrink-0" />
              <a href={`mailto:${settings.supportEmail}`} className="link-quiet">
                {settings.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <PhoneIcon size={16} className="mt-0.5 shrink-0" />
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="link-quiet">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <PinIcon size={16} className="mt-0.5 shrink-0" />
              <span>{settings.address}</span>
            </li>
          </ul>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="eyebrow text-bone">{column.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-quiet">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ink-line">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div className="max-w-md">
            <h2 className="eyebrow text-bone">Novedades y restock</h2>
            <p className="mt-2 mb-4 text-sm text-mute">
              Lanzamientos y ofertas del distribuidor oficial, sin spam.
            </p>
            <NewsletterForm />
          </div>

          <div className="lg:justify-self-end">
            <h2 className="eyebrow text-bone">Medios de pago</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {["Mercado Pago", "Débito", "Crédito", "Cuotas", "Transferencia"].map((method) => (
                <li
                  key={method}
                  className="border border-ink-line px-3 py-1.5 text-[11px] text-mute"
                >
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-line">
        <div className="container-page flex flex-col gap-2 py-6 text-[11px] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
          </p>
          <p>Precios en pesos chilenos con IVA incluido.</p>
        </div>
      </div>
    </footer>
  );
}
