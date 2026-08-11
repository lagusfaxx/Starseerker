import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Ajustes de la tienda</h1>
      <p className="mt-2 text-sm text-mute">
        Estos valores se usan en la portada, el pie de página y los correos transaccionales.
      </p>

      <form action={updateSettings} className="mt-8 space-y-8">
        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Logo</h2>
          <p className="text-xs text-mute">
            Deja el archivo en <code className="text-bone">public/</code> y escribe la ruta
            (por ejemplo <code className="text-bone">/logo.svg</code>), o pega una URL completa.
            Si lo dejas vacío se usa el logotipo tipográfico.
          </p>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Text name="logoUrl" label="Archivo o URL del logo" value={settings.logoUrl} />
            <div>
              <label className="field-label">Alto en la cabecera (px)</label>
              <input
                name="logoHeight"
                type="number"
                min={12}
                max={80}
                defaultValue={settings.logoHeight}
                className="field"
              />
            </div>
          </div>
          {settings.logoUrl && (
            <div className="border border-ink-line p-4">
              <p className="field-label">Vista previa</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl}
                alt="Logo actual"
                style={{ height: settings.logoHeight }}
                className="w-auto"
              />
            </div>
          )}
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Identidad</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="storeName" label="Nombre de la tienda" value={settings.storeName} />
            <Text name="tagline" label="Bajada" value={settings.tagline} />
            <Text name="supportEmail" label="Email de soporte" value={settings.supportEmail} />
            <Text name="salesEmail" label="Email de ventas" value={settings.salesEmail} />
            <Text name="phone" label="Teléfono" value={settings.phone} />
            <Text name="whatsapp" label="WhatsApp" value={settings.whatsapp} />
            <Text name="address" label="Dirección" value={settings.address} />
            <Text name="instagram" label="Instagram (URL)" value={settings.instagram} />
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Portada</h2>
          <div className="grid gap-4">
            <Text name="heroTitle" label="Título principal" value={settings.heroTitle} />
            <div>
              <label className="field-label">Subtítulo</label>
              <textarea
                name="heroSubtitle"
                rows={2}
                defaultValue={settings.heroSubtitle}
                className="field"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text name="heroCtaLabel" label="Texto del botón" value={settings.heroCtaLabel} />
              <Text name="heroCtaHref" label="Enlace del botón" value={settings.heroCtaHref} />
              <Text
                name="heroVideoUrl"
                label="Video de fondo (URL .mp4)"
                value={settings.heroVideoUrl}
              />
              <Text name="heroPosterUrl" label="Imagen de respaldo" value={settings.heroPosterUrl} />
            </div>
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Barra de anuncios</h2>
          <Text name="announcement" label="Mensaje" value={settings.announcement} />
          <label className="flex items-center gap-2 text-xs text-mute">
            <input
              type="checkbox"
              name="announcementActive"
              defaultChecked={settings.announcementActive}
              className="h-4 w-4 "
            />
            Mostrar la barra en la tienda
          </label>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-bold">Reglas comerciales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Umbral de envío gratis (CLP)</label>
              <input
                name="freeShippingThreshold"
                type="number"
                min={0}
                defaultValue={settings.freeShippingThreshold ?? ""}
                placeholder="Vacío = sin umbral"
                className="field"
              />
              <p className="mt-1 text-[11px] text-mute">
                Solo se muestra como mensaje. El descuento real se define en cada tarifa de envío.
              </p>
            </div>
            <div>
              <label className="field-label">Monto mínimo de pedido (CLP)</label>
              <input
                name="minOrderTotal"
                type="number"
                min={0}
                defaultValue={settings.minOrderTotal}
                className="field"
              />
            </div>
          </div>
        </section>

        <button className="btn btn-primary">
          Guardar ajustes
        </button>
      </form>
    </div>
  );
}

function Text({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input name={name} defaultValue={value} className="field" />
    </div>
  );
}
