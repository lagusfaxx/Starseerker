"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";

export type NavLink = { label: string; href: string };

export function SiteHeader({
  links,
  announcement,
}: {
  links: NavLink[];
  announcement: string | null;
}) {
  const { count, open } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      {announcement && (
        <div className="bg-accent text-ink">
          <div className="container-page overflow-hidden py-2">
            <p className="truncate text-center text-xs font-semibold tracking-wide">
              {announcement}
            </p>
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 border-b border-ink-line transition-colors ${
          scrolled ? "bg-ink/95 backdrop-blur" : "bg-ink"
        }`}
      >
        <div className="container-page flex items-center gap-4 py-3">
          <button
            className="lg:hidden text-xl leading-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            ☰
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-bone/70 text-[11px] font-black">
              SS
            </span>
            <span className="text-sm font-black tracking-[0.22em] sm:text-base">STARSEEKER</span>
          </Link>

          <form onSubmit={onSearch} className="ml-auto hidden max-w-2xl flex-1 md:block">
            <div className="flex items-center rounded-full border border-ink-line bg-ink-soft px-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca molinos, máquinas, accesorios…"
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-mute"
                aria-label="Buscar productos"
              />
              <button type="submit" aria-label="Buscar" className="text-mute hover:text-bone">
                ⌕
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <Link
              href="/pedido"
              className="hidden text-xs text-mute hover:text-bone sm:block"
              title="Seguimiento de pedido"
            >
              Mi pedido
            </Link>
            <button
              onClick={open}
              className="relative text-lg"
              aria-label={`Abrir carrito (${count} productos)`}
            >
              🛒
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-ink-line lg:block">
          <div className="container-page flex gap-7 py-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-bone/85 transition hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-ink-line lg:hidden">
            <div className="container-page py-4">
              <form onSubmit={onSearch} className="mb-4 md:hidden">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar…"
                  className="field"
                  aria-label="Buscar productos"
                />
              </form>
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-2 py-2.5 text-sm hover:bg-white/5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/pedido"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-2 py-2.5 text-sm hover:bg-white/5"
                  >
                    Seguimiento de pedido
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
