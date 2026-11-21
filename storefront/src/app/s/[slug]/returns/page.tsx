import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReturnRequestForm } from "@/components/storefront/ReturnRequestForm";
import { StorefrontPageShell } from "@/components/storefront/StorefrontPageShell";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";
import { getStoreBuildPayload } from "@/lib/store-payload-server";
import type { MockLocale } from "@/mock/types";

export const metadata: Metadata = {
  title: "الاستبدال والاسترجاع | CommerceForge",
  robots: { index: false, follow: false },
};

export default async function StoreReturnsPage({
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
  const name = (locale === "en" ? payload.config.store_name_en : payload.config.store_name) ?? payload.config.store_name ?? slug;
  const isArabic = locale === "ar";
  const returnPolicy = payload.config.returns_policy?.[locale];

  return (
    <StorefrontPageShell locale={locale} slug={slug} storeName={name} user={user}>
      <section className="order-tracking-page">
        <span className="eyebrow">{isArabic ? "خدمة العملاء" : "Customer service"}</span>
        <h1>{isArabic ? "الاستبدال والاسترجاع" : "Returns & exchange"}</h1>
        {returnPolicy && <p className="dashboard-description">{returnPolicy}</p>}
        <ReturnRequestForm locale={locale} slug={slug} />
      </section>
    </StorefrontPageShell>
  );
}
