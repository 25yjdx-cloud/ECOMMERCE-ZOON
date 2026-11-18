import type { MockProduct } from "@/mock/types";

export type CartLine = {
  product: MockProduct;
  quantity: number;
};

export function addToCart(
  lines: readonly CartLine[],
  product: MockProduct,
  quantity = 1,
): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError("Cart quantity must be a positive integer.");
  }

  const existing = lines.find((line) => line.product.id === product.id);
  if (!existing) {
    return [...lines, { product, quantity }];
  }

  return lines.map((line) =>
    line.product.id === product.id
      ? { ...line, quantity: line.quantity + quantity }
      : line,
  );
}

export function updateCartQuantity(
  lines: readonly CartLine[],
  productId: string,
  quantity: number,
): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError("Cart quantity must be a non-negative integer.");
  }

  if (quantity === 0) {
    return lines.filter((line) => line.product.id !== productId);
  }

  return lines.map((line) =>
    line.product.id === productId ? { ...line, quantity } : line,
  );
}

export function removeFromCart(
  lines: readonly CartLine[],
  productId: string,
): CartLine[] {
  return lines.filter((line) => line.product.id !== productId);
}

export function getCartSubtotal(lines: readonly CartLine[]): number {
  return lines.reduce((subtotal, line) => subtotal + line.product.price * line.quantity, 0);
}
