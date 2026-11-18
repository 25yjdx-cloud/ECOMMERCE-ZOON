import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";
import type { MockLocale } from "@/mock/types";

type CartPageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "سلة تجريبية",
  robots: { index: false, follow: false },
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const query = await searchParams;
  const language = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale: MockLocale = language === "en" ? "en" : "ar";

  return <CartClient locale={locale} />;
}
