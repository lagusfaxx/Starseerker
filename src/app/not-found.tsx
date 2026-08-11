import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">Error 404</p>
        <h1 className="mt-4 display text-3xl sm:text-4xl">
          No encontramos esta página
        </h1>
        <p className="mt-3 text-sm text-mute">
          Puede que el producto ya no esté disponible o que el enlace haya cambiado.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="btn btn-outline"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  );
}
