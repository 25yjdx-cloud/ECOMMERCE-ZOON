import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderTrackingForm } from "@/components/merchant/OrderTrackingForm";
import { StorefrontPageShell } from "@/components/storefront/StorefrontPageShell";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";
import { getStoreBuildPayload } from "@/lib/store-payload-server";
import type { MockLocale } from "@/mock/types";

export const metadata: Metadata = {
  title: "تتبع الطلب | CommerceForge",
  robots: { index: false, follow: false },
};

export default async function StoreTrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<QueryValues>;
}) {
  const [{ slug }, query, user] = await Promise.all([params, searchParams, getAuthUser()]);
  const payload = await getStoreBuildPayload(slug);
  if (!payload) notFound();

  const locale: MockLocale = getLocale(query.lang);
  const name = payload.config.store_name ?? slug;

  return (
    <StorefrontPageShell locale={locale} slug={slug} storeName={name} user={user}>
      <section className="order-tracking-page">
        <span className="eyebrow">{locale === "ar" ? "تحديثات الشحن" : "Shipping updates"}</span>
        <h1>{locale === "ar" ? "تابع طلبك خطوة بخطوة" : "Follow your order"}</h1>
        <OrderTrackingForm locale={locale} storeSlug={slug} />
      </section>
    </StorefrontPageShell>
  );
}
