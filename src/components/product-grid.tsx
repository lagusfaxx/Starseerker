import { ProductCard, type ProductCardData } from "@/components/product-card";

/**
 * Grilla continua: las tarjetas se separan con filetes, sin espacios entre
 * ellas, como en la tienda de referencia.
 */
export function ProductGrid({
  products,
  emptyMessage = "No encontramos productos con esos filtros.",
}: {
  products: ProductCardData[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="border border-ink-line px-6 py-20 text-center text-sm text-mute">
        {emptyMessage}
      </div>
    );
  }

  const columns =
    products.length === 1
      ? "sm:grid-cols-1"
      : products.length === 2
        ? "sm:grid-cols-2"
        : products.length === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 border-t border-l border-ink-line ${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
