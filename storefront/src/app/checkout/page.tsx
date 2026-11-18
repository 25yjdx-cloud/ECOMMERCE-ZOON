import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import type { MockLocale } from "@/mock/types";

type CheckoutPageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "إتمام طلب تجريبي",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const query = await searchParams;
  const language = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale: MockLocale = language === "en" ? "en" : "ar";

  return (
    <main className="page-shell commerce-page" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="commerce-heading">
        <span className="eyebrow">{locale === "ar" ? "بيانات التوصيل" : "Delivery details"}</span>
        <h1 className="page-heading">{locale === "ar" ? "إتمام الطلب" : "Checkout"}</h1>
      </div>
      <CheckoutForm locale={locale} />
    </main>
  );
}
