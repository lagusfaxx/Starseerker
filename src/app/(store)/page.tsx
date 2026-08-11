import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product-grid";
import { safeListCategories, safeListProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatCLP } from "@/lib/format";
import { ArrowRightIcon, BoxIcon, CardIcon, ShieldIcon, TruckIcon } from "@/components/icons";

export const revalidate = 120;

const SERVICES = [
  {
    Icon: BoxIcon,
    title: "Importación directa",
    text: "Stock en Chile, ingresado por canales formales y con documentación al día.",
  },
  {
    Icon: TruckIcon,
    title: "Despacho a 16 regiones",
    text: "Tarifa y plazo visibles antes de pagar, según la comuna de destino.",
  },
  {
    Icon: CardIcon,
    title: "Pago en cuotas",
    text: "Débito, crédito y transferencia mediante Mercado Pago.",
  },
  {
    Icon: ShieldIcon,
    title: "Garantía y servicio local",
    text: "Repuestos y soporte técnico en el país, sin envíos al extranjero.",
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

  const highlighted = featured.products.length > 0 ? featured.products : newArrivals.products;

  return (
    <>
      {/* Portada */}
      <section className="relative isolate border-b border-ink-line">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {settings.heroVideoUrl ? (
            <video
              className="h-full w-full object-cover opacity-45"
              src={settings.heroVideoUrl}
              poster={settings.heroPosterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : settings.heroPosterUrl ? (
            <Image
              src={settings.heroPosterUrl}
              alt=""
              fill
              priority
              className="object-cover opacity-45"
            />
          ) : (
            <div className="h-full w-full bg-ink-soft" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        </div>

        <div className="container-page grid min-h-[30rem] items-center gap-10 py-20 lg:min-h-[34rem] lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">{settings.tagline}</p>
            <h1 className="display mt-5 max-w-2xl text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem]">
              {settings.heroTitle}
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-bone/75">
              {settings.heroSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={settings.heroCtaHref} className="btn btn-primary">
                {settings.heroCtaLabel}
              </Link>
              <Link href="/ayuda/despachos" className="btn btn-outline">
                Costos de despacho
              </Link>
            </div>
          </div>

          <dl className="grid max-w-md grid-cols-2 gap-px self-end border border-ink-line bg-ink-line lg:justify-self-end">
            {[
              { label: "Regiones con cobertura", value: "16" },
              { label: "Garantía oficial", value: "12 meses" },
              { label: "Despacho en RM", value: "24-48 h" },
              {
                label: "Envío gratis desde",
                value: settings.freeShippingThreshold
                  ? formatCLP(settings.freeShippingThreshold)
                  : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink px-5 py-6">
                <dt className="eyebrow text-[10px]">{stat.label}</dt>
                <dd className="tnum mt-2 text-xl font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Servicios */}
      <section className="border-b border-ink-line bg-ink-soft">
        <div className="container-page grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ Icon, title, text }) => (
            <div key={title} className="flex gap-3.5">
              <Icon size={22} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <h2 className="text-[13px] font-semibold">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-mute">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <SectionHeader
            title="Comprar por categoría"
            href="/productos"
            linkLabel="Ver el catálogo completo"
          />
          <div className="mt-7 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/coleccion/${category.slug}`}
                className="group relative flex aspect-[16/9] flex-col justify-end overflow-hidden bg-ink p-6"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover opacity-45 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
                <div className="relative">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 max-w-sm text-xs text-bone/65">
                      {category.description}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-accent uppercase">
                    Ver productos
                    <ArrowRightIcon size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      <section className="container-page pb-16">
        <SectionHeader
          title="Selección destacada"
          href="/productos"
          linkLabel="Ver todos los productos"
        />
        <div className="mt-7">
          <ProductGrid
            products={highlighted}
            emptyMessage="Todavía no hay productos publicados. Cárgalos desde el panel de administración."
          />
        </div>
      </section>

      {/* Novedades */}
      {newArrivals.products.length > 0 && (
        <section className="border-t border-ink-line">
          <div className="container-page py-16">
            <SectionHeader
              title="Últimos lanzamientos"
              href="/productos?filtro=nuevos"
              linkLabel="Ver novedades"
            />
            <div className="mt-7">
              <ProductGrid products={newArrivals.products} />
            </div>
          </div>
        </section>
      )}

      {/* Más vendidos */}
      {bestSellers.products.length > 0 && (
        <section className="border-t border-ink-line">
          <div className="container-page py-16">
            <SectionHeader
              title="Los más vendidos"
              href="/productos?filtro=mas-vendidos"
              linkLabel="Ver ranking"
            />
            <div className="mt-7">
              <ProductGrid products={bestSellers.products} />
            </div>
          </div>
        </section>
      )}

      {/* Despachos */}
      <section className="border-t border-ink-line bg-ink-soft">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Despachos</p>
            <h2 className="display mt-3 text-3xl">Tarifas por región, sin sorpresas</h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-mute">
              El costo de envío se calcula según la región de destino y se muestra completo antes
              de pagar
              {settings.freeShippingThreshold
                ? `. Sobre ${formatCLP(settings.freeShippingThreshold)} el despacho es gratis en gran parte del país.`
                : "."}
            </p>
            <Link href="/ayuda/despachos" className="btn btn-outline mt-7">
              Ver tabla de despachos
            </Link>
          </div>

          <table className="w-full self-start border border-ink-line text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="eyebrow px-4 py-3 font-semibold">Zona</th>
                <th className="eyebrow px-4 py-3 font-semibold">Plazo estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {[
                ["Región Metropolitana", "1 a 2 días hábiles"],
                ["Zona centro", "2 a 4 días hábiles"],
                ["Zona norte y sur", "3 a 6 días hábiles"],
                ["Aysén y Magallanes", "5 a 12 días hábiles"],
              ].map(([zone, eta]) => (
                <tr key={zone}>
                  <td className="px-4 py-3">{zone}</td>
                  <td className="px-4 py-3 text-mute">{eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-line pb-4">
      <h2 className="display text-2xl">{title}</h2>
      <Link
        href={href}
        className="link-quiet inline-flex items-center gap-1.5 text-[13px] font-medium"
      >
        {linkLabel}
        <ArrowRightIcon size={15} />
      </Link>
    </div>
  );
}
