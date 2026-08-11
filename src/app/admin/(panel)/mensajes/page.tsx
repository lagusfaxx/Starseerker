import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { markMessageHandled } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const [messages, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Mensajes</h1>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          <h2 className="text-sm font-bold">Formulario de contacto</h2>
          {messages.length === 0 && (
            <p className="panel px-5 py-10 text-center text-sm text-mute">
              Sin mensajes por ahora.
            </p>
          )}
          {messages.map((message) => (
            <article
              key={message.id}
              className={`panel p-5 ${message.handled ? "opacity-60" : ""}`}
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{message.subject}</h3>
                  <p className="mt-0.5 text-xs text-mute">
                    {message.name} · {message.email}
                    {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <form action={markMessageHandled}>
                  <input type="hidden" name="id" value={message.id} />
                  <button className="btn btn-outline btn-sm">
                    {message.handled ? "Marcar pendiente" : "Marcar resuelto"}
                  </button>
                </form>
              </header>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-bone/80">
                {message.message}
              </p>
              <a
                href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                className="mt-3 inline-block text-xs text-accent underline"
              >
                Responder por correo
              </a>
            </article>
          ))}
        </section>

        <section>
          <h2 className="text-sm font-bold">Suscriptores ({subscribers.length})</h2>
          <div className="panel mt-4 max-h-[560px] overflow-y-auto">
            <ul className="divide-y divide-ink-line text-xs">
              {subscribers.length === 0 && (
                <li className="px-4 py-8 text-center text-mute">Sin suscriptores.</li>
              )}
              {subscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex justify-between gap-3 px-4 py-2.5">
                  <span className="truncate">{subscriber.email}</span>
                  <span className="text-mute whitespace-nowrap">
                    {formatDateTime(subscriber.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
