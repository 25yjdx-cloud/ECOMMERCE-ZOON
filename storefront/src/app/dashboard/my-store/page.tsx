import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getPreset } from "@/lib/presets";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";

export default async function MyStorePage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();
  if (!user) redirect("/login?lang=ar&redirect=%2Fdashboard%2Fmy-store");
  if (user.role !== "merchant") redirect("/manager/classic?lang=ar");

  const preset = user.storeSlug ? getPreset(user.storeSlug) : undefined;
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
        <section className="dashboard-panel">
          <h2>{user.storeSlug}</h2>
          <p>
            {isArabic
              ? "ربط بيانات المتجر ولوحة الإدارة يتطلب تجهيز خدمة Bagisto وقاعدة بيانات مستقلة."
              : "Connecting store data and management requires a configured Bagisto service and isolated database."}
          </p>
          {preset && (
            <Link className="button-link" href={`/preview/${preset.id}?lang=${locale}`}>
              {isArabic ? "معاينة القالب" : "Preview template"}
            </Link>
          )}
        </section>
      ) : (
        <section className="dashboard-panel" role="status">
          <h2>{isArabic ? "لا يوجد متجر مرتبط بالحساب بعد" : "No store is linked to this account yet"}</h2>
          <p>
            {isArabic
              ? "لن تظهر بيانات متجر آخر هنا. سيظهر متجرك بعد إنشاء نسخة عميل وربط قاعدة بياناته."
              : "Another merchant's data will not appear here. Your store will show after a client copy and its database are configured."}
          </p>
          <Link className="button-link secondary" href={`/gallery?lang=${locale}`}>
            {isArabic ? "استعراض القوالب" : "Browse templates"}
          </Link>
        </section>
      )}
    </main>
  );
}
