import { redirect } from "next/navigation";
import { MerchantStoreDashboard } from "@/components/merchant/MerchantStoreDashboard";
import { getAuthUser } from "@/lib/auth";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<QueryValues>;
}) {
  const [query, user] = await Promise.all([searchParams, getAuthUser()]);
  const locale = getLocale(query.lang);
  if (!user) redirect(`/login?lang=${locale}&redirect=%2Fdashboard%2Forders`);
  if (user.role !== "merchant") redirect(`/manager?lang=${locale}`);
  if (!user.storeSlug) redirect(`/launch?lang=${locale}`);

  const isArabic = locale === "ar";

  return (
    <main className="dashboard-page">
      <LocaleDocumentAttributes locale={locale} />
      <span className="eyebrow">CommerceForge</span>
      <h1>{isArabic ? "الطلبات" : "Orders"}</h1>
      <p className="dashboard-description">
        {isArabic ? "طلبات المتجر والصلاحيات المخصصة لفريق العمل." : "Store orders and the permissions assigned to your staff."}
      </p>
      <MerchantStoreDashboard
        initialSection="orders"
        locale={locale}
        memberRole={user.memberRole ?? null}
        slug={user.storeSlug}
      />
    </main>
  );
}
