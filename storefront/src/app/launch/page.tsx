import { notFound, redirect } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { StoreLaunchForm } from "@/components/merchant/StoreLaunchForm";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getPreset } from "@/lib/presets";
import { getAuthUser } from "@/lib/auth";
import { Footer } from "@/components/landing/Footer";

export default async function LaunchPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const templateParam = Array.isArray(query.template) ? query.template[0] : query.template;
  const preset = getPreset(templateParam ?? "classic");
  if (!preset) notFound();

  const user = await getAuthUser();
  if (!user) {
    const destination = `/launch?template=${encodeURIComponent(preset.id)}&lang=${locale}`;
    redirect(`/login?lang=${locale}&redirect=${encodeURIComponent(destination)}`);
  }
  if (user.role === "super_admin") redirect(`/manager/${preset.id}?lang=${locale}`);
  if (user.storeSlug) redirect(`/dashboard/my-store?lang=${locale}`);

  const isArabic = locale === "ar";

  return (
    <div lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/launch" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="launch-page page-shell">
        <span className="eyebrow">{isArabic ? "إطلاق متجرك" : "Launch your store"}</span>
        <h1>{isArabic ? `ابدأ بقالب ${preset.name.ar}` : `Start with ${preset.name.en}`}</h1>
        <p className="dashboard-description">
          {isArabic
            ? "أضف بيانات متجرك الأساسية. سيُنشأ متجر مستقل لحسابك وتُنسخ إليه منتجات القالب."
            : "Add your store basics. A store isolated to your account will be created with a copy of the preset products."}
        </p>
        <StoreLaunchForm locale={locale} preset={preset} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
