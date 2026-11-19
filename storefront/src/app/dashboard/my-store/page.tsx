import { redirect } from "next/navigation";
import Link from "next/link";
import { MerchantStoreDashboard } from "@/components/merchant/MerchantStoreDashboard";
import { getAuthUser } from "@/lib/auth";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";

export default async function MyStorePage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();
  if (!user) redirect("/login?lang=ar&redirect=%2Fdashboard%2Fmy-store");
  if (user.role !== "merchant") redirect("/manager/classic?lang=ar");

  const selectedPlan = Array.isArray(query.plan) ? query.plan[0] : query.plan;

  return (
    <main className="dashboard-page">
      <LocaleDocumentAttributes locale={locale} />
      <span className="eyebrow">CommerceForge</span>
      <h1>{isArabic ? "متجري" : "My store"}</h1>
      <p className="dashboard-description">
        {isArabic
          ? `أهلاً ${user.name}. هذه المساحة تعرض متجرك المملوك لحسابك فقط.`
          : `Welcome, ${user.name}. This area only shows the store assigned to your account.`}
      </p>
      {selectedPlan && (
        <p className="auth-notice" role="status">
          {isArabic
            ? `تم اختيار باقة ${selectedPlan} للمتابعة؛ لم يُفعّل الاشتراك لأن الدفع غير موصول بعد.`
            : `Plan ${selectedPlan} selected; the subscription is not active because payments are not connected.`}
        </p>
      )}
      {user.storeSlug ? (
        <MerchantStoreDashboard locale={locale} slug={user.storeSlug} />
      ) : (
        <section className="dashboard-panel" role="status">
          <h2>{isArabic ? "لا يوجد متجر مرتبط بالحساب بعد" : "No store is linked to this account yet"}</h2>
          <p>
            {isArabic
              ? "ابدأ باختيار قالب لإنشاء متجر مستقل مرتبط بحسابك."
              : "Choose a preset to create a store isolated to your account."}
          </p>
          <Link className="button-link secondary" href={`/gallery?lang=${locale}`}>
            {isArabic ? "استعراض القوالب" : "Browse templates"}
          </Link>
        </section>
      )}
    </main>
  );
}
