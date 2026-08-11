import { prisma } from "@/lib/prisma";
import { REGIONS } from "@/lib/regions";
import { formatCLP } from "@/lib/format";
import { deleteRate, deleteZone, saveRate, saveZone } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function RegionPicker({ selected }: { selected: string[] }) {
  return (
    <fieldset>
      <legend className="field-label">Regiones que cubre esta zona</legend>
      <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map((region) => (
          <label key={region.code} className="flex items-center gap-2 text-xs text-bone/80">
            <input
              type="checkbox"
              name="regionCodes"
              value={region.code}
              defaultChecked={selected.includes(region.code)}
              className="h-3.5 w-3.5 "
            />
            {region.shortName}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function RateForm({
  zoneId,
  rate,
}: {
  zoneId: string;
  rate?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    freeOver: number | null;
    etaMinDays: number;
    etaMaxDays: number;
    minSubtotal: number;
    maxSubtotal: number | null;
    isPickup: boolean;
    active: boolean;
    position: number;
  };
}) {
  return (
    <form action={saveRate} className="grid gap-3 md:grid-cols-6">
      <input type="hidden" name="zoneId" value={zoneId} />
      {rate && <input type="hidden" name="id" value={rate.id} />}

      <div className="md:col-span-2">
        <label className="field-label">Nombre</label>
        <input
          name="name"
          defaultValue={rate?.name ?? ""}
          placeholder="Despacho estándar"
          className="field"
          required
        />
      </div>
      <div>
        <label className="field-label">Precio</label>
        <input
          name="price"
          type="number"
          min={0}
          defaultValue={rate?.price ?? 0}
          className="field"
        />
      </div>
      <div>
        <label className="field-label">Gratis sobre</label>
        <input
          name="freeOver"
          type="number"
          min={0}
          defaultValue={rate?.freeOver ?? ""}
          placeholder="—"
          className="field"
        />
      </div>
      <div>
        <label className="field-label">Días mín.</label>
        <input
          name="etaMinDays"
          type="number"
          min={0}
          defaultValue={rate?.etaMinDays ?? 2}
          className="field"
        />
      </div>
      <div>
        <label className="field-label">Días máx.</label>
        <input
          name="etaMaxDays"
          type="number"
          min={0}
          defaultValue={rate?.etaMaxDays ?? 5}
          className="field"
        />
      </div>

      <div className="md:col-span-2">
        <label className="field-label">Descripción</label>
        <input
          name="description"
          defaultValue={rate?.description ?? ""}
          placeholder="Entrega en domicilio"
          className="field"
        />
      </div>
      <div>
        <label className="field-label">Subtotal mín.</label>
        <input
          name="minSubtotal"
          type="number"
          min={0}
          defaultValue={rate?.minSubtotal ?? 0}
          className="field"
        />
      </div>
      <div>
        <label className="field-label">Subtotal máx.</label>
        <input
          name="maxSubtotal"
          type="number"
          min={0}
          defaultValue={rate?.maxSubtotal ?? ""}
          placeholder="—"
          className="field"
        />
      </div>
      <div>
        <label className="field-label">Orden</label>
        <input
          name="position"
          type="number"
          defaultValue={rate?.position ?? 0}
          className="field"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4 md:col-span-6">
        <label className="flex items-center gap-2 text-xs text-mute">
          <input
            type="checkbox"
            name="isPickup"
            defaultChecked={rate?.isPickup ?? false}
            className="h-4 w-4 "
          />
          Retiro en tienda (sin dirección)
        </label>
        <label className="flex items-center gap-2 text-xs text-mute">
          <input
            type="checkbox"
            name="active"
            defaultChecked={rate?.active ?? true}
            className="h-4 w-4 "
          />
          Activa
        </label>
        <button className="btn btn-primary btn-sm">
          {rate ? "Guardar tarifa" : "Agregar tarifa"}
        </button>
      </div>
    </form>
  );
}

export default async function AdminShippingPage() {
  const zones = await prisma.shippingZone.findMany({
    include: { rates: { orderBy: [{ position: "asc" }, { price: "asc" }] } },
    orderBy: { position: "asc" },
  });

  const covered = new Set(zones.filter((z) => z.active).flatMap((z) => z.regionCodes));
  const uncovered = REGIONS.filter((region) => !covered.has(region.code));

  return (
    <div>
      <h1 className="text-2xl font-bold">Envíos por región</h1>
      <p className="mt-2 max-w-3xl text-sm text-mute">
        Agrupa regiones en zonas y define una o más tarifas para cada zona. En el checkout el
        cliente ve solo las tarifas de la zona que cubre su región, con su plazo estimado.
      </p>

      {uncovered.length > 0 && (
        <p className="mt-4 rounded-xs border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
          Sin cobertura: {uncovered.map((r) => r.shortName).join(", ")}. Los clientes de esas
          regiones no podrán completar la compra.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {zones.map((zone) => (
          <section key={zone.id} className="panel p-5">
            <form action={saveZone} className="space-y-4">
              <input type="hidden" name="id" value={zone.id} />
              <div className="grid gap-4 sm:grid-cols-[1.2fr_1.6fr_auto]">
                <div>
                  <label className="field-label">Nombre de la zona</label>
                  <input name="name" defaultValue={zone.name} className="field" required />
                </div>
                <div>
                  <label className="field-label">Descripción interna</label>
                  <input name="description" defaultValue={zone.description ?? ""} className="field" />
                </div>
                <div>
                  <label className="field-label">Orden</label>
                  <input
                    name="position"
                    type="number"
                    defaultValue={zone.position}
                    className="field w-24"
                  />
                </div>
              </div>

              <RegionPicker selected={zone.regionCodes} />

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-mute">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={zone.active}
                    className="h-4 w-4 "
                  />
                  Zona activa
                </label>
                <button className="btn btn-outline btn-sm">
                  Guardar zona
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-ink-line pt-5">
              <h3 className="text-xs font-bold tracking-[0.14em] text-mute uppercase">
                Tarifas de {zone.name}
              </h3>

              <div className="mt-4 space-y-6">
                {zone.rates.map((rate) => (
                  <div key={rate.id} className="rounded-xs border border-ink-line p-4">
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold">
                        {rate.name} · {rate.price === 0 ? "Gratis" : formatCLP(rate.price)}
                        {rate.freeOver ? ` · gratis sobre ${formatCLP(rate.freeOver)}` : ""}
                      </span>
                      <form action={deleteRate}>
                        <input type="hidden" name="id" value={rate.id} />
                        <button className="text-red-400/80 hover:text-red-300">Eliminar</button>
                      </form>
                    </div>
                    <RateForm zoneId={zone.id} rate={rate} />
                  </div>
                ))}

                <div className="rounded-xs border border-dashed border-ink-line p-4">
                  <p className="mb-3 text-xs font-semibold text-mute">Nueva tarifa</p>
                  <RateForm zoneId={zone.id} />
                </div>
              </div>
            </div>

            <form action={deleteZone} className="mt-5 border-t border-ink-line pt-4">
              <input type="hidden" name="id" value={zone.id} />
              <button className="text-xs text-red-400/80 hover:text-red-300">
                Eliminar zona completa
              </button>
            </form>
          </section>
        ))}
      </div>

      <section className="panel mt-8 p-5">
        <h2 className="text-sm font-bold">Nueva zona</h2>
        <form action={saveZone} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1.2fr_1.6fr_auto]">
            <div>
              <label className="field-label">Nombre</label>
              <input
                name="name"
                placeholder="Región Metropolitana"
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label">Descripción interna</label>
              <input name="description" className="field" />
            </div>
            <div>
              <label className="field-label">Orden</label>
              <input name="position" type="number" defaultValue={0} className="field w-24" />
            </div>
          </div>

          <RegionPicker selected={[]} />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-mute">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 "
              />
              Zona activa
            </label>
            <button className="btn btn-primary btn-sm">
              Crear zona
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
