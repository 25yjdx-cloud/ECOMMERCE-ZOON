import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { MerchantWorkspace } from "@/components/dashboard/MerchantWorkspace";

type View = "overview" | "orders" | "products" | "files" | "storefront" | "analytics" | "settings";

export async function AuthenticatedDashboardPage({ view, searchParams }: { view: View; searchParams: Promise<QueryValues> }) {
  const [query, user] = await Promise.all([searchParams, getAuthUser()]);
  const locale = getLocale(query.lang);
  if (!user) redirect(`/login?lang=${locale}&redirect=%2Fdashboard%2F${view === "overview" ? "" : view}`);
  if (user.role !== "merchant") redirect(`/manager?lang=${locale}`);
  const isStaff = user.memberRole === "staff" || user.memberRole === "order_manager";
  if (!user.storeSlug) redirect(`/launch?lang=${locale}`);
  if (isStaff && view !== "orders") redirect(`/dashboard/orders?lang=${locale}`);

  return <>
    <LocaleDocumentAttributes locale={locale} />
    <MerchantWorkspace view={view} locale={locale} user={user} storeSlug={user.storeSlug} />
  </>;
}
