import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/order-summary";
import type { OrderStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Esperando pago" },
  { value: "PAID", label: "Pagados" },
  { value: "PREPARING", label: "Preparando" },
  { value: "SHIPPED", label: "En camino" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

const PAGE_SIZE = 30;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; pagina?: string }>;
}) {
  const { estado, q, pagina } = await searchParams;
  const page = Math.max(1, Number(pagina) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (estado && FILTERS.some((f) => f.value === estado)) where.status = estado as OrderStatus;
  if (q?.trim()) {
    where.OR = [
      { number: { contains: q.trim(), mode: "insensitive" } },
      { email: { contains: q.trim(), mode: "insensitive" } },
      { firstName: { contains: q.trim(), mode: "insensitive" } },
      { lastName: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { items: { select: { id: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <form className="flex gap-2">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por número, email o nombre"
            className="field w-64 py-2 text-xs"
          />
          <button className="rounded-xl border border-ink-line px-4 text-xs hover:border-bone">
            Buscar
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const params = new URLSearchParams();
          if (filter.value) params.set("estado", filter.value);
          if (q) params.set("q", q);
          const active = (estado ?? "") === filter.value;
          return (
            <Link
              key={filter.label}
              href={`/admin/pedidos${params.toString() ? `?${params}` : ""}`}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                active
                  ? "border-bone bg-bone font-semibold text-ink"
                  : "border-ink-line text-mute hover:border-bone hover:text-bone"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="card-surface mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-ink-line text-left text-xs text-mute">
            <tr>
              <th className="px-5 py-3 font-medium">Pedido</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Destino</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-mute">
                  No hay pedidos con esos filtros.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-white/5">
                <td className="px-5 py-3">
                  <Link href={`/admin/pedidos/${order.id}`} className="font-semibold hover:text-accent">
                    {order.number}
                  </Link>
                  <p className="text-xs text-mute">{formatDateTime(order.createdAt)}</p>
                </td>
                <td className="px-5 py-3">
                  <p>
                    {order.firstName} {order.lastName}
                  </p>
                  <p className="text-xs text-mute">{order.email}</p>
                </td>
                <td className="px-5 py-3 text-xs text-mute">
                  {order.comuna ? `${order.comuna}, ` : ""}
                  {order.regionName ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-right font-semibold">{formatCLP(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
            const params = new URLSearchParams();
            if (estado) params.set("estado", estado);
            if (q) params.set("q", q);
            if (n > 1) params.set("pagina", String(n));
            return (
              <Link
                key={n}
                href={`/admin/pedidos${params.toString() ? `?${params}` : ""}`}
                className={`grid h-9 w-9 place-items-center rounded-full border text-xs ${
                  n === page ? "border-bone bg-bone font-bold text-ink" : "border-ink-line text-mute"
                }`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
