"use client";

import type { MockProduct, MockLocale } from "@/mock/types";
import { useCart } from "./CartProvider";

type AddToCartButtonProps = {
  locale: MockLocale;
  product: MockProduct;
};

export function AddToCartButton({ locale, product }: AddToCartButtonProps) {
  const { add } = useCart();

  return (
    <button className="button-link cart-action" type="button" onClick={() => add(product)}>
      {locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
    </button>
  );
}
