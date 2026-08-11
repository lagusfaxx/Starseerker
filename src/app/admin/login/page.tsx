import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSession, getSession, verifyCredentials } from "@/lib/auth";

export const metadata: Metadata = { title: "Acceso al panel", robots: { index: false } };
export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const session = await verifyCredentials(email, password);
  if (!session) redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);

  await createSession(session);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  if (await getSession()) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-semibold tracking-[0.26em]">STARSEEKER</p>
          <p className="mt-1 text-xs text-mute">Panel de administración</p>
        </div>

        <form action={login} className="panel space-y-4 p-6">
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <div>
            <label className="field-label" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="field"
            />
          </div>

          {error && (
            <p className="rounded-xs border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              Credenciales incorrectas.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
