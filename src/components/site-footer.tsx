import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { Logo } from "@/components/logo";
import type { StoreSettings } from "@/lib/settings";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Tienda",
    links: [
      { label: "Novedades", href: "/productos?filtro=nuevos" },
      { label: "Más vendidos", href: "/productos?filtro=mas-vendidos" },
      { label: "Colección", href: "/productos" },
      { label: "Ofertas", href: "/productos?filtro=ofertas" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Centro de ayuda", href: "/ayuda" },
      { label: "Despachos", href: "/ayuda/despachos" },
      { label: "Devoluciones", href: "/ayuda/devoluciones" },
      { label: "Garantía", href: "/ayuda/garantia" },
      { label: "Seguir mi pedido", href: "/pedido" },
    ],
  },
  {
    title: "STARSEEKER Chile",
    links: [
      { label: "Quiénes somos", href: "/nosotros" },
      { label: "Contacto", href: "/contacto" },
      { label: "Términos", href: "/legal/terminos" },
      { label: "Privacidad", href: "/legal/privacidad" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="border-t border-ink-line">
      <div className="container-page py-14 text-center">
        <Logo
          logoUrl={settings.logoUrl}
          logoHeight={settings.logoHeight}
          storeName={settings.storeName}
          className="justify-center"
        />
        <p className="mx-auto mt-4 max-w-md text-sm text-mute">{settings.tagline}</p>

        <div className="mx-auto mt-9 max-w-md">
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page grid gap-10 border-t border-ink-line py-12 sm:grid-cols-3">
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="text-center sm:text-left">
            <h2 className="eyebrow">{column.title}</h2>
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
        <div className="container-page flex flex-col items-center gap-2 py-6 text-[11px] text-mute sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}
          </p>
          <p>
            <a href={`mailto:${settings.supportEmail}`} className="link-quiet">
              {settings.supportEmail}
            </a>
            <span className="mx-2">·</span>
            Pagos con Mercado Pago
          </p>
        </div>
      </div>
    </footer>
  );
}
