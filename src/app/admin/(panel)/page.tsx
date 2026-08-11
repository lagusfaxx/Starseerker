import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/order-summary";

export const dynamic = "force-dynamic";

function startOfDay(offsetDays = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offsetDays);
  return date;
}

export default async function AdminDashboard() {
  const [todayPaid, monthPaid, pendingCount, lowStock, latest, unhandled] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED", paidAt: { gte: startOfDay() } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED", paidAt: { gte: startOfDay(30) } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 3 } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, stock: true, slug: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        number: true,
        firstName: true,
        lastName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.contactMessage.count({ where: { handled: false } }),
  ]);

  const cards = [
    {
      label: "Ventas de hoy",
      value: formatCLP(todayPaid._sum.total ?? 0),
      hint: `${todayPaid._count} pedidos pagados`,
    },
    {
      label: "Últimos 30 días",
      value: formatCLP(monthPaid._sum.total ?? 0),
      hint: `${monthPaid._count} pedidos pagados`,
    },
    {
      label: "Esperando pago",
      value: String(pendingCount),
      hint: "Pedidos sin acreditar",
    },
    {
      label: "Mensajes sin leer",
      value: String(unhandled),
      hint: "Formulario de contacto",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Resumen</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card-surface p-5">
            <p className="text-xs text-mute">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-mute">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card-surface overflow-hidden">
          <header className="flex items-center justify-between border-b border-ink-line px-5 py-4">
            <h2 className="text-sm font-bold">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-xs text-mute hover:text-bone">
              Ver todos
            </Link>
          </header>
          {latest.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-mute">Aún no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-ink-line">
              {latest.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{order.number}</p>
                      <p className="truncate text-xs text-mute">
                        {order.firstName} {order.lastName} · {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {formatCLP(order.total)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-surface overflow-hidden">
          <header className="flex items-center justify-between border-b border-ink-line px-5 py-4">
            <h2 className="text-sm font-bold">Stock bajo</h2>
            <Link href="/admin/productos" className="text-xs text-mute hover:text-bone">
              Productos
            </Link>
          </header>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-mute">Todo con stock saludable.</p>
          ) : (
            <ul className="divide-y divide-ink-line">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <p className="min-w-0 flex-1 truncate text-sm">{product.name}</p>
                  <span
                    className={`text-sm font-bold ${product.stock === 0 ? "text-red-400" : "text-amber-300"}`}
                  >
                    {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
