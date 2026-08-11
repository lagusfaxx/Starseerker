"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { Logo } from "@/components/logo";
import { BagIcon, CloseIcon, MenuIcon, PhoneIcon, SearchIcon, TruckIcon } from "@/components/icons";

export type NavLink = { label: string; href: string };

export function SiteHeader({
  links,
  announcement,
  phone,
  logoUrl,
  logoHeight,
  storeName,
}: {
  links: NavLink[];
  announcement: string | null;
  phone: string;
  logoUrl: string;
  logoHeight: number;
  storeName: string;
}) {
  const { count, open } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Bloquea el scroll del cuerpo mientras el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setMenuOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(value)}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-ink">
      {announcement && (
        <div className="border-b border-ink-line bg-ink-soft">
          <div className="container-page py-2">
            <p className="text-center text-[11px] tracking-wide text-bone/75">{announcement}</p>
          </div>
        </div>
      )}

      {/* Barra de utilidades */}
      <div className="hidden border-b border-ink-line lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] text-mute">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <TruckIcon size={14} />
              Despacho a todo Chile
            </span>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-quiet inline-flex items-center gap-1.5">
              <PhoneIcon size={14} />
              {phone}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pedido" className="link-quiet">
              Seguimiento de pedido
            </Link>
            <Link href="/ayuda/despachos" className="link-quiet">
              Costos de despacho
            </Link>
            <Link href="/contacto" className="link-quiet">
              Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="border-b border-ink-line">
        <div className="container-page flex h-16 items-center gap-5 lg:h-20">
          <button
            className="-ml-1 p-1 text-bone lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon size={22} />
          </button>

          <Logo
            logoUrl={logoUrl}
            logoHeight={logoHeight}
            storeName={storeName}
            className="shrink-0"
          />

          <form onSubmit={onSearch} className="ml-auto hidden max-w-xl flex-1 lg:ml-10 lg:block">
            <div className="flex items-center gap-2 border border-ink-line bg-[#0e0e10] px-3 focus-within:border-[#55555f]">
              <SearchIcon size={17} className="shrink-0 text-mute" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar molinos, máquinas o accesorios"
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-[#5f5f68]"
                aria-label="Buscar productos"
              />
              <button type="submit" className="eyebrow shrink-0 py-2 hover:text-bone">
                Buscar
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 lg:ml-6">
            <Link
              href="/buscar"
              className="p-2 text-bone lg:hidden"
              aria-label="Buscar"
              onClick={(event) => {
                event.preventDefault();
                setMenuOpen(true);
              }}
            >
              <SearchIcon size={20} />
            </Link>
            <button
              onClick={open}
              className="relative flex items-center gap-2 p-2 text-bone"
              aria-label={`Abrir carrito, ${count} productos`}
            >
              <BagIcon size={20} />
              {count > 0 && (
                <span className="tnum absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="hidden border-b border-ink-line lg:block">
        <div className="container-page flex h-11 items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-bone/80 transition hover:text-bone"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-ink-line bg-ink">
            <div className="flex h-16 items-center justify-between border-b border-ink-line px-5">
              <Logo logoUrl={logoUrl} logoHeight={logoHeight} storeName={storeName} href={null} />
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="p-1">
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={onSearch} className="border-b border-ink-line p-5">
              <div className="flex items-center gap-2 border border-ink-line bg-[#0e0e10] px-3">
                <SearchIcon size={16} className="text-mute" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar productos"
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  aria-label="Buscar productos"
                  autoFocus
                />
              </div>
            </form>

            <nav className="flex-1 overflow-y-auto p-2">
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-ink-line/60 px-3 py-3.5 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 px-3 text-xs text-mute">
                {[
                  { label: "Seguimiento de pedido", href: "/pedido" },
                  { label: "Costos de despacho", href: "/ayuda/despachos" },
                  { label: "Contacto", href: "/contacto" },
                ].map((link) => (
                  <li key={link.href} className="py-2">
                    <Link href={link.href} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
