import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Seguimiento de pedido" };

async function findOrder(formData: FormData) {
  "use server";

  const number = String(formData.get("number") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!number || !email) redirect("/pedido?error=1");

  const order = await prisma.order.findUnique({ where: { number } });
  if (!order || order.email !== email) redirect("/pedido?error=1");

  redirect(`/pedido/${order.number}?token=${order.publicToken}`);
}

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md">
        <h1 className="display text-3xl">Seguimiento de pedido</h1>
        <p className="mt-3 text-sm text-mute">
          Ingresa el número de pedido que te enviamos por correo y el email de la compra.
        </p>

        <form action={findOrder} className="panel mt-8 space-y-4 p-6">
          <div>
            <label className="field-label" htmlFor="number">
              Número de pedido
            </label>
            <input id="number" name="number" placeholder="SS-2608-4821" className="field" required />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Correo de la compra
            </label>
            <input id="email" name="email" type="email" className="field" required />
          </div>

          {error && (
            <p className="rounded-xs border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              No encontramos un pedido con esos datos.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Buscar pedido
          </button>
        </form>
      </div>
    </div>
  );
}
