"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Navegación del panel agrupada por tarea, para no buscar entre una lista larga. */
const GROUPS: { title: string; links: { href: string; label: string; exact?: boolean }[] }[] = [
  {
    title: "Ventas",
    links: [
      { href: "/admin", label: "Resumen", exact: true },
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/cupones", label: "Cupones" },
      { href: "/admin/mensajes", label: "Mensajes" },
    ],
  },
  {
    title: "Catálogo",
    links: [
      { href: "/admin/productos", label: "Productos" },
      { href: "/admin/categorias", label: "Categorías" },
    ],
  },
  {
    title: "Tienda",
    links: [
      { href: "/admin/portada", label: "Portada" },
      { href: "/admin/envios", label: "Envíos por región" },
      { href: "/admin/ajustes", label: "Ajustes" },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="px-3 pb-4 lg:flex-1">
      <div className="flex gap-6 overflow-x-auto lg:block lg:space-y-6 lg:overflow-visible">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="eyebrow hidden px-3 pb-2 text-[10px] lg:block">{group.title}</p>
            <ul className="flex gap-1 lg:flex-col">
              {group.links.map((link) => {
                const active = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-md px-3 py-2 text-sm whitespace-nowrap transition ${
                        active
                          ? "bg-bone font-semibold text-black"
                          : "text-mute hover:bg-white/5 hover:text-bone"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
