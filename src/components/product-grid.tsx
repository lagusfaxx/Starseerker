import { ProductCard, type ProductCardData } from "@/components/product-card";

/** Con pocos productos la grilla se estrecha y queda centrada, sin huecos. */
const LAYOUTS: Record<number, string> = {
  1: "sm:max-w-xs",
  2: "sm:max-w-2xl sm:grid-cols-2",
  3: "sm:max-w-4xl sm:grid-cols-2 lg:grid-cols-3",
};

const DEFAULT_LAYOUT = "sm:max-w-none sm:grid-cols-2 lg:grid-cols-4";

export function ProductGrid({
  products,
  emptyMessage = "No encontramos productos con esos filtros.",
}: {
  products: ProductCardData[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <div className="panel px-6 py-20 text-center text-sm text-mute">{emptyMessage}</div>;
  }

  return (
    <div
      className={`mx-auto grid max-w-sm gap-5 ${LAYOUTS[products.length] ?? DEFAULT_LAYOUT}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
