import { describe, expect, it } from "vitest";
import { addToCart, getCartSubtotal, removeFromCart, updateCartQuantity } from "./cart";
import type { MockProduct } from "@/mock/types";

const product: MockProduct = {
  id: "sample-1",
  name: { ar: "منتج تجريبي", en: "Demo product" },
  category: { ar: "تجريبي", en: "Demo" },
  description: { ar: "بيانات اختبار", en: "Test data" },
  price: 250,
  preset: "fashion",
};

describe("mock cart", () => {
  it("adds a product and increases quantity for repeated additions", () => {
    const once = addToCart([], product);
    const twice = addToCart(once, product);

    expect(twice).toEqual([{ product, quantity: 2 }]);
  });

  it("updates and removes line quantities", () => {
    const lines = addToCart([], product, 3);

    expect(updateCartQuantity(lines, product.id, 2)[0]?.quantity).toBe(2);
    expect(updateCartQuantity(lines, product.id, 0)).toEqual([]);
    expect(removeFromCart(lines, product.id)).toEqual([]);
  });

  it("calculates the subtotal and rejects invalid quantities", () => {
    const lines = addToCart([], product, 2);

    expect(getCartSubtotal(lines)).toBe(500);
    expect(() => addToCart([], product, 0)).toThrow(RangeError);
    expect(() => updateCartQuantity(lines, product.id, -1)).toThrow(RangeError);
  });
});
