import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product-grid";
import { safeListCategories, safeListProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatCLP } from "@/lib/format";

export const revalidate = 120;

const BENEFITS = [
  {
    title: "Distribuidor oficial",
    text: "Importamos directo desde STARSEEKER. Productos originales con garantía respaldada en Chile.",
  },
  {
    title: "Despacho a todo Chile",
    text: "Desde Arica a Punta Arenas, con tarifas y plazos claros por región antes de pagar.",
  },
  {
    title: "Paga como quieras",
    text: "Débito, crédito en cuotas y transferencia a través de Mercado Pago con protección al comprador.",
  },
  {
    title: "Servicio técnico local",
    text: "Repuestos y soporte en Chile: no necesitas enviar tu equipo al extranjero.",
  },
];

export default async function HomePage() {
  const [settings, featured, newArrivals, bestSellers, categories] = await Promise.all([
    getSettings(),
    safeListProducts({ filter: "destacados", take: 8 }),
    safeListProducts({ filter: "nuevos", take: 4 }),
    safeListProducts({ filter: "mas-vendidos", take: 4 }),
    safeListCategories(),
  ]);

  const heroProducts = featured.products.length > 0 ? featured : newArrivals;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-ink-line">
        <div className="absolute inset-0 -z-10">
          {settings.heroVideoUrl ? (
            <video
              className="h-full w-full object-cover opacity-55"
              src={settings.heroVideoUrl}
              poster={settings.heroPosterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_0%,#26262a_0%,#0b0b0c_60%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        </div>

        <div className="container-page flex min-h-[62vh] flex-col justify-end py-20 sm:min-h-[70vh]">
          <p className="animate-fade-up text-xs font-semibold tracking-[0.3em] text-accent uppercase">
            {settings.tagline}
          </p>
          <h1 className="animate-fade-up mt-4 max-w-3xl text-4xl leading-[1.05] font-black tracking-tight text-balance sm:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-bone/80">
            {settings.heroSubtitle}
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link
              href={settings.heroCtaHref}
              className="rounded-full bg-bone px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-white"
            >
              {settings.heroCtaLabel}
            </Link>
            <Link
              href="/ayuda/despachos"
              className="rounded-full border border-bone/30 px-7 py-3.5 text-sm font-semibold transition hover:border-bone"
            >
              Ver costos de despacho
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-b border-ink-line bg-ink-soft">
        <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title}>
              <h2 className="text-sm font-bold">{benefit.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-mute">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Colecciones"
            title="Encuentra tu equipo"
            href="/productos"
            linkLabel="Ver todo"
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/coleccion/${category.slug}`}
                className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-ink-line bg-ink-soft"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg font-bold">{category.name}</h3>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-bone/70">{category.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      <section className="container-page py-8">
        <SectionHeading
          eyebrow="Selección STARSEEKER"
          title="Destacados de la temporada"
          href="/productos"
          linkLabel="Ver toda la tienda"
        />
        <div className="mt-8">
          <ProductGrid
            products={heroProducts.products}
            emptyMessage="Aún no hay productos publicados. Cárgalos desde el panel de administración."
          />
        </div>
      </section>

      {/* Nuevos */}
      {newArrivals.products.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Recién llegados"
            title="Nuevos lanzamientos"
            href="/productos?filtro=nuevos"
            linkLabel="Ver novedades"
          />
          <div className="mt-8">
            <ProductGrid products={newArrivals.products} />
          </div>
        </section>
      )}

      {/* Más vendidos */}
      {bestSellers.products.length > 0 && (
        <section className="container-page py-8">
          <SectionHeading
            eyebrow="Los favoritos"
            title="Más vendidos en Chile"
            href="/productos?filtro=mas-vendidos"
            linkLabel="Ver ranking"
          />
          <div className="mt-8">
            <ProductGrid products={bestSellers.products} />
          </div>
        </section>
      )}

      {/* Envíos */}
      <section className="container-page py-20">
        <div className="card-surface grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">
              Despachos
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Tarifas claras para las 16 regiones
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mute">
              Configuramos el costo y el plazo de entrega por región. Antes de pagar ves exactamente
              cuánto cuesta llegar a tu comuna
              {settings.freeShippingThreshold
                ? `, y sobre ${formatCLP(settings.freeShippingThreshold)} el despacho es gratis.`
                : "."}
            </p>
            <Link
              href="/ayuda/despachos"
              className="mt-6 inline-block rounded-full border border-ink-line px-6 py-3 text-sm font-semibold transition hover:border-bone"
            >
              Ver tabla de despachos
            </Link>
          </div>
          <ul className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              "Retiro gratis en Santiago",
              "Entrega en 24-48 h en RM",
              "Cobertura en regiones extremas",
              "Seguimiento por correo",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-ink-line bg-ink px-4 py-3 text-bone/85"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      <Link
        href={href}
        className="text-sm font-semibold text-mute underline underline-offset-4 transition hover:text-bone"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
