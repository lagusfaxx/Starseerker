import Link from "next/link";

/** Encabezado de sección: título condensado a la izquierda y enlace opcional. */
export function SectionTitle({
  title,
  href,
  linkLabel,
  className = "",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 pb-8 ${className}`}>
      <h2 className="section-title">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="link-quiet font-display text-xs tracking-[0.18em] uppercase"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
