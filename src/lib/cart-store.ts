/**
 * Store del carrito fuera de React, persistido en localStorage y compartido
 * entre pestañas. Se consume con `useSyncExternalStore`, de modo que la
 * hidratación arranca con un carrito vacío (igual que el HTML del servidor)
 * y se sincroniza con el estado real en el primer render del cliente.
 */
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  image: string | null;
  quantity: number;
  maxStock: number;
};

export type CartSnapshot = { items: CartItem[]; ready: boolean };

const STORAGE_KEY = "ss-cart-v1";
const SERVER_SNAPSHOT: CartSnapshot = { items: [], ready: false };

let snapshot: CartSnapshot | null = null;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as CartItem).productId === "string" &&
        typeof (item as CartItem).quantity === "number" &&
        (item as CartItem).quantity > 0,
    );
  } catch {
    return [];
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(items: CartItem[]) {
  snapshot = { items, ready: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Modo privado o cuota llena: el carrito sigue funcionando en memoria.
  }
  emit();
}

export function getSnapshot(): CartSnapshot {
  if (!snapshot) snapshot = { items: readStorage(), ready: true };
  return snapshot;
}

export function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = { items: readStorage(), ready: true };
    emit();
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ---------------------------------------------------------------------------
// Mutaciones
// ---------------------------------------------------------------------------

export function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = getSnapshot().items;
  const cap = Math.max(1, item.maxStock || 1);
  const existing = items.find((i) => i.productId === item.productId);

  commit(
    existing
      ? items.map((i) =>
          i.productId === item.productId
            ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, cap) }
            : i,
        )
      : [...items, { ...item, quantity: Math.min(quantity, cap) }],
  );
}

export function setQuantity(productId: string, quantity: number) {
  const items = getSnapshot().items;
  commit(
    quantity <= 0
      ? items.filter((i) => i.productId !== productId)
      : items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(quantity, Math.max(1, i.maxStock || 1)) }
            : i,
        ),
  );
}

export function removeItem(productId: string) {
  commit(getSnapshot().items.filter((i) => i.productId !== productId));
}

export function clearCart() {
  if (getSnapshot().items.length === 0) return;
  commit([]);
}
