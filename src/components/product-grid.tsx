import { ProductCard, type ProductCardData } from "@/components/product-card";

export function ProductGrid({
  products,
  emptyMessage = "No encontramos productos con esos filtros.",
}: {
  products: ProductCardData[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="card-surface px-6 py-16 text-center text-sm text-mute">{emptyMessage}</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
