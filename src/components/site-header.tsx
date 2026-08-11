"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { Logo } from "@/components/logo";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";

export type NavLink = { label: string; href: string };

export function SiteHeader({
  links,
  announcement,
  logoUrl,
  logoHeight,
  storeName,
}: {
  links: NavLink[];
  announcement: string | null;
  logoUrl: string;
  logoHeight: number;
  storeName: string;
}) {
  const { count, open } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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
        <p className="border-b border-ink-line py-2 text-center text-[11px] tracking-[0.08em] text-mute">
          {announcement}
        </p>
      )}

      <div className="container-page flex h-[68px] items-center gap-4">
        <button
          className="-ml-1 p-1 lg:hidden"
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

        <form onSubmit={onSearch} className="mx-6 hidden flex-1 lg:block">
          <div className="flex items-center gap-3 rounded-lg bg-ink-soft px-4 transition focus-within:ring-1 focus-within:ring-accent/60">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Escribe aquí y presiona buscar"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-[#6a6a70]"
              aria-label="Buscar productos"
            />
            <button type="submit" aria-label="Buscar" className="link-quiet shrink-0 py-2">
              <SearchIcon size={19} />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="link-quiet lg:hidden"
            aria-label="Buscar"
          >
            <SearchIcon size={20} />
          </button>
          <Link href="/pedido" className="link-quiet hidden sm:block" aria-label="Mi pedido">
            <UserIcon size={21} />
          </Link>
          <button onClick={open} className="link-quiet relative" aria-label={`Carrito, ${count} productos`}>
            <BagIcon size={21} />
            {count > 0 && (
              <span className="tnum absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-ink-line lg:block">
        <div className="container-page flex h-11 items-center gap-9">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-wide transition hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/80"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-ink">
            <div className="flex h-[68px] items-center justify-between border-b border-ink-line px-5">
              <Logo logoUrl={logoUrl} logoHeight={logoHeight} storeName={storeName} href={null} />
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar" className="p-1">
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={onSearch} className="p-5">
              <div className="flex items-center gap-3 rounded-lg bg-ink-soft px-4">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar"
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                  aria-label="Buscar productos"
                  autoFocus
                />
                <button type="submit" aria-label="Buscar" className="link-quiet">
                  <SearchIcon size={18} />
                </button>
              </div>
            </form>

            <nav className="flex-1 overflow-y-auto px-5">
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-ink-line py-3.5 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/pedido"
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-ink-line py-3.5 text-sm"
                  >
                    Mi pedido
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
