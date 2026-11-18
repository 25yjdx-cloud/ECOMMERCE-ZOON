"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

type CartSummaryLinkProps = {
  locale: "ar" | "en";
};

export function CartSummaryLink({ locale }: CartSummaryLinkProps) {
  const { itemCount } = useCart();
  const label = locale === "ar" ? `السلة (${itemCount})` : `Cart (${itemCount})`;

  return <Link className="text-link" href={`/cart?lang=${locale}`}>{label}</Link>;
}
