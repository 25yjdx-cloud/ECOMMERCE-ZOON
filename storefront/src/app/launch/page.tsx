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
        <div className="launch-brand-header"><span className="launch-logo-url-hint">{isArabic ? "يمكن إضافة رابط شعار في إعدادات الهوية بعد الإطلاق." : "A logo URL can be added in branding settings after launch."}</span></div>
        <span className="eyebrow">{isArabic ? "إطلاق متجرك" : "Launch your store"}</span>
        <h1>{isArabic ? `ابدأ بقالب ${preset.name.ar}` : `Start with ${preset.name.en}`}</h1>
        <p className="dashboard-description">
          {isArabic
            ? "أكمل 70% من متجرك الآن باختيار القالب والهوية والمنتجات. خلال 24–48 ساعة يراجع المطور التفاصيل ويضبط الدومين والاستضافة ويؤكد التسليم النهائي."
            : "Complete 70% of your store now with a template, branding, and products. Within 24–48 hours, a developer reviews the details, configures the domain and hosting, and confirms final delivery."}
        </p>
        <StoreLaunchForm
          initialMarket={user.market ?? null}
          initialWhatsappPhone={user.whatsappPhone ?? null}
          locale={locale}
          preset={preset}
        />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
