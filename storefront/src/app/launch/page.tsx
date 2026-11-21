import { redirect } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { StoreLaunchForm } from "@/components/merchant/StoreLaunchForm";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";
import { Footer } from "@/components/landing/Footer";

export default async function LaunchPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);

  const user = await getAuthUser();
  if (!user) {
    const destination = `/launch?lang=${locale}`;
    redirect(`/login?lang=${locale}&redirect=${encodeURIComponent(destination)}`);
  }
  if (user.role === "super_admin") redirect(`/manager?lang=${locale}`);
  if (user.storeSlug) redirect(`/dashboard/my-store?lang=${locale}`);

  const isArabic = locale === "ar";

  return (
    <div lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/launch" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="launch-page page-shell">
        <span className="eyebrow">{isArabic ? "من فكرتك إلى متجرك" : "From your idea to your store"}</span>
        <h1>{isArabic ? "أنشئ متجرك بنقرة واحدة" : "Build your store in one click"}</h1>
        <p className="dashboard-description">
          {isArabic
            ? "أدخل أربع معلومات بسيطة، وسنجهز لك واجهة عربية وإنجليزية بهوية تناسب نشاطك وسياسة استرجاع واضحة."
            : "Enter four quick details and get a tailored Arabic and English storefront, matching colors, and a clear return policy."}
        </p>
        <StoreLaunchForm
          initialWhatsappPhone={user.whatsappPhone ?? null}
          locale={locale}
        />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
