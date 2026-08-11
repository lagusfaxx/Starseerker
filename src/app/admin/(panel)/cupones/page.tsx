import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/format";
import { deleteCoupon, saveCoupon } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "PERCENT", label: "Porcentaje (%)" },
  { value: "FIXED", label: "Monto fijo (CLP)" },
  { value: "FREE_SHIPPING", label: "Envío gratis" },
];

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Cupones</h1>
      <p className="mt-2 text-sm text-mute">
        Los códigos se validan en el servidor al momento de pagar: vigencia, mínimo de compra y
        límite de usos.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-line text-left text-xs text-mute">
              <tr>
                <th className="px-5 py-3 font-medium">Código</th>
                <th className="px-5 py-3 font-medium">Descuento</th>
                <th className="px-5 py-3 font-medium">Mínimo</th>
                <th className="px-5 py-3 font-medium">Usos</th>
                <th className="px-5 py-3 font-medium">Vence</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-mute">
                    Sin cupones creados.
                  </td>
                </tr>
              )}
              {coupons.map((coupon) => (
                <tr key={coupon.code}>
                  <td className="px-5 py-3">
                    <span className="font-mono font-semibold">{coupon.code}</span>
                    {!coupon.active && <span className="ml-2 text-xs text-mute">(inactivo)</span>}
                  </td>
                  <td className="px-5 py-3">
                    {coupon.type === "PERCENT"
                      ? `${coupon.value}%`
                      : coupon.type === "FIXED"
                        ? formatCLP(coupon.value)
                        : "Envío gratis"}
                  </td>
                  <td className="px-5 py-3 text-xs text-mute">
                    {coupon.minSubtotal > 0 ? formatCLP(coupon.minSubtotal) : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-mute">
                    {coupon.uses}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-5 py-3 text-xs text-mute">
                    {coupon.expiresAt ? toDateInput(coupon.expiresAt) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteCoupon}>
                      <input type="hidden" name="code" value={coupon.code} />
                      <button className="text-xs text-red-400/80 hover:text-red-300">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={saveCoupon} className="panel h-fit space-y-4 p-5">
          <h2 className="text-sm font-bold">Crear o actualizar cupón</h2>
          <div>
            <label className="field-label">Código</label>
            <input name="code" placeholder="SS10" className="field uppercase" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Tipo</label>
              <select name="type" className="field" defaultValue="PERCENT">
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Valor</label>
              <input name="value" type="number" min={0} defaultValue={10} className="field" />
            </div>
            <div>
              <label className="field-label">Compra mínima</label>
              <input name="minSubtotal" type="number" min={0} defaultValue={0} className="field" />
            </div>
            <div>
              <label className="field-label">Usos máximos</label>
              <input name="maxUses" type="number" min={0} placeholder="—" className="field" />
            </div>
            <div>
              <label className="field-label">Desde</label>
              <input name="startsAt" type="date" className="field" />
            </div>
            <div>
              <label className="field-label">Hasta</label>
              <input name="expiresAt" type="date" className="field" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-mute">
            <input
              type="checkbox"
              name="active"
              defaultChecked
              className="h-4 w-4 "
            />
            Activo
          </label>
          <button className="btn btn-light w-full">
            Guardar cupón
          </button>
        </form>
      </div>
    </div>
  );
}
