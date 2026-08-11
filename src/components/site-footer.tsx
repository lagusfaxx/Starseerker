import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import type { StoreSettings } from "@/lib/settings";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Tienda",
    links: [
      { label: "Todos los productos", href: "/productos" },
      { label: "Nuevos lanzamientos", href: "/productos?filtro=nuevos" },
      { label: "Más vendidos", href: "/productos?filtro=mas-vendidos" },
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
      { label: "Seguimiento de pedido", href: "/pedido" },
    ],
  },
  {
    title: "STARSEEKER Chile",
    links: [
      { label: "Quiénes somos", href: "/nosotros" },
      { label: "Contacto", href: "/contacto" },
      { label: "Términos y condiciones", href: "/legal/terminos" },
      { label: "Privacidad", href: "/legal/privacidad" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-20 border-t border-ink-line bg-ink-soft">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <div className="text-base font-black tracking-[0.22em]">STARSEEKER</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">
            {settings.tagline}. Productos originales, boleta o factura y garantía respaldada en
            Chile.
          </p>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-mute uppercase">
              Novedades y ofertas
            </p>
            <NewsletterForm />
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase">{column.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-mute transition hover:text-bone">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-line">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Pagos seguros con Mercado Pago</span>
            <span aria-hidden>·</span>
            <a href={`mailto:${settings.supportEmail}`} className="hover:text-bone">
              {settings.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
