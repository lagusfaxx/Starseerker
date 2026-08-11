import Link from "next/link";

/** Título de sección centrado con el filete de cobre de la marca. */
export function SectionTitle({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="pt-16 pb-9 text-center">
      <h2 className="display text-2xl sm:text-[1.75rem]">{title}</h2>
      <span className="rule-accent" aria-hidden="true" />
      {href && linkLabel && (
        <Link
          href={href}
          className="link-quiet mt-5 inline-block text-[12px] tracking-[0.14em] uppercase"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
