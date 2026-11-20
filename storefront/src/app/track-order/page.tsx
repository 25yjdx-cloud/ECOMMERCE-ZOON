import type { Metadata } from "next";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { OrderTrackingForm } from "@/components/merchant/OrderTrackingForm";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";

export const metadata: Metadata = {
  title: "تتبع الطلب | CommerceForge",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <LandingHeader basePath="/track-order" dictionary={getDictionary(locale)} locale={locale} query={query} user={null} />
      <main className="page-shell order-tracking-page">
        <span className="eyebrow">{locale === "ar" ? "تحديثات الشحن" : "Shipping updates"}</span>
        <h1>{locale === "ar" ? "تابع طلبك خطوة بخطوة" : "Follow your order"}</h1>
        <OrderTrackingForm locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
