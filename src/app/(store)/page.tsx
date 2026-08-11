import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product-grid";
import { SectionTitle } from "@/components/section-title";
import { safeListCategories, safeListProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const revalidate = 120;

export default async function HomePage() {
  const [settings, newArrivals, bestSellers, featured, categories] = await Promise.all([
    getSettings(),
    safeListProducts({ filter: "nuevos", take: 4 }),
    safeListProducts({ filter: "mas-vendidos", take: 4 }),
    safeListProducts({ filter: "destacados", take: 4 }),
    safeListCategories(),
  ]);

  const arrivals = newArrivals.products.length > 0 ? newArrivals.products : featured.products;

  return (
    <>
      {/* Portada en video */}
      <section className="relative">
        <div className="relative aspect-[21/9] max-h-[76vh] w-full overflow-hidden bg-ink">
          {settings.heroVideoUrl ? (
            <video
              className="h-full w-full object-cover"
              src={settings.heroVideoUrl}
              poster={settings.heroPosterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : settings.heroPosterUrl ? (
            <Image src={settings.heroPosterUrl} alt="" fill priority className="object-cover" />
          ) : (
            <div className="h-full w-full bg-ink-soft" />
          )}

          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="max-w-4xl text-center text-2xl font-light text-white italic drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] sm:text-4xl lg:text-[2.75rem]">
              {settings.heroTitle}
            </p>
          </div>
        </div>

        {/* Franja bajo el video */}
        <div className="bg-ink py-10 text-center">
          <h1 className="display container-page text-xl text-balance sm:text-2xl lg:text-[1.75rem]">
            {settings.heroSubtitle}
          </h1>
          {settings.heroCtaLabel && (
            <Link href={settings.heroCtaHref} className="btn btn-primary mt-7">
              {settings.heroCtaLabel}
            </Link>
          )}
        </div>
      </section>

      {/* Novedades */}
      <section className="container-page pb-20">
        <SectionTitle title="Novedades" href="/productos?filtro=nuevos" linkLabel="Ver todas" />
        <ProductGrid
          products={arrivals}
          emptyMessage="Todavía no hay productos publicados. Cárgalos desde el panel de administración."
        />
      </section>

      {/* Más vendidos */}
      {bestSellers.products.length > 0 && (
        <section className="container-page pb-20">
          <SectionTitle
            title="Más vendidos"
            href="/productos?filtro=mas-vendidos"
            linkLabel="Ver todos"
          />
          <ProductGrid products={bestSellers.products} />
        </section>
      )}

      {/* Colecciones */}
      {categories.length > 0 && (
        <section className="container-page pb-24">
          <SectionTitle title="Colecciones" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/coleccion/${category.slug}`}
                className="group relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-xl bg-ink-soft"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative p-7 text-center">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="mt-2 inline-block text-[11px] tracking-[0.2em] text-accent uppercase">
                    Ver colección
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Garantía */}
      <section className="border-t border-ink-line">
        <div className="container-page py-16 text-center">
          <p className="eyebrow">{settings.tagline}</p>
          <h2 className="display mx-auto mt-4 max-w-2xl text-2xl text-balance sm:text-3xl">
            Garantía oficial, servicio técnico y repuestos en Chile
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-mute">
            Importamos directo desde STARSEEKER. Despachamos a las 16 regiones y respondemos por
            cada equipo sin trámites en el extranjero.
          </p>
          <Link href="/ayuda/garantia" className="btn btn-outline mt-8">
            Conocer la garantía
          </Link>
        </div>
      </section>
    </>
  );
}
