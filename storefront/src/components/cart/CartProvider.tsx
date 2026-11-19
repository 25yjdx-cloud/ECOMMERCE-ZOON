"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { MockProduct } from "@/mock/types";
import {
  addToCart,
  getCartSubtotal,
  removeFromCart,
  updateCartQuantity,
  type CartLine,
} from "@/features/cart/cart";

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  add: (product: MockProduct) => void;
  addItem: (product: MockProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

type CartAction =
  | { type: "add"; product: MockProduct; quantity: number }
  | { type: "quantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

function cartReducer(items: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add":
      return addToCart(items, action.product, action.quantity);
    case "quantity":
      return updateCartQuantity(items, action.productId, action.quantity);
    case "remove":
      return removeFromCart(items, action.productId);
    case "clear":
      return [];
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((count, line) => count + line.quantity, 0),
      subtotal: getCartSubtotal(items),
      add: (product) => dispatch({ type: "add", product, quantity: 1 }),
      addItem: (product, quantity = 1) => dispatch({ type: "add", product, quantity }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: "quantity", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return cart;
}
