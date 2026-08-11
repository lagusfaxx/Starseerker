import { CartProvider } from "@/components/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader, type NavLink } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

async function navLinks(): Promise<NavLink[]> {
  const links: NavLink[] = [{ label: "Inicio", href: "/" }];
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      take: 6,
      select: { slug: true, name: true },
    });
    links.push(...categories.map((c) => ({ label: c.name, href: `/coleccion/${c.slug}` })));
  } catch {
    // Sin base de datos mostramos solo la navegación estática.
  }
  links.push(
    { label: "Nuevos", href: "/productos?filtro=nuevos" },
    { label: "Más vendidos", href: "/productos?filtro=mas-vendidos" },
    { label: "Centro de ayuda", href: "/ayuda" },
  );
  return links;
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, links] = await Promise.all([getSettings(), navLinks()]);

  return (
    <CartProvider>
      <SiteHeader
        links={links}
        announcement={settings.announcementActive ? settings.announcement : null}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
    </CartProvider>
  );
}
