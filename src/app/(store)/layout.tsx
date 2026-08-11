import { CartProvider } from "@/components/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader, type NavLink } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";

/** Navegación principal, breve a propósito. */
const NAV: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Novedades", href: "/productos?filtro=nuevos" },
  { label: "Más vendidos", href: "/productos?filtro=mas-vendidos" },
  { label: "Colección", href: "/productos" },
  { label: "Centro de ayuda", href: "/ayuda" },
];

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <CartProvider>
      <SiteHeader
        links={NAV}
        announcement={settings.announcementActive ? settings.announcement : null}
        logoUrl={settings.logoUrl}
        logoHeight={settings.logoHeight}
        storeName={settings.storeName}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
    </CartProvider>
  );
}
