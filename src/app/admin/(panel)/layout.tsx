import Link from "next/link";
import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { ExternalIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  await destroySession();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-ink-line bg-ink-soft lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Link href="/admin" className="block">
            <p className="text-sm font-semibold tracking-[0.22em]">STARSEEKER</p>
            <p className="mt-0.5 text-[11px] text-mute">Panel de administración</p>
          </Link>
        </div>

        <AdminNav />

        <div className="border-t border-ink-line px-5 py-4 text-xs">
          <p className="truncate font-medium">{session.name}</p>
          <p className="truncate text-mute">{session.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/"
              className="link-quiet inline-flex items-center gap-1.5"
              target="_blank"
            >
              Ver tienda
              <ExternalIcon size={13} />
            </Link>
            <form action={logout}>
              <button className="text-mute hover:text-bone">Cerrar sesión</button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-ink px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}
