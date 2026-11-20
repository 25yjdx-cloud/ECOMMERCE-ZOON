import type { Metadata } from "next";
import Link from "next/link";
import { AccountThemeToggle } from "@/components/theme/AccountThemeToggle";
import { TwoFactorSettings } from "@/components/auth/TwoFactorSettings";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "إعدادات الحساب | CommerceForge",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();
  const createStoreHref = user ? "/launch" : "/login?redirect=%2Flaunch";

  return (
    <div lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/account" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="account-page page-shell">
        <header className="account-page-heading">
          <span className="eyebrow">{isArabic ? "حساب CommerceForge" : "CommerceForge account"}</span>
          <h1>{isArabic ? "إعدادات الحساب" : "Account settings"}</h1>
          <p>
            {isArabic
              ? "70% من متجرك ينطلق فوراً باختيار القالب والهوية والمنتجات، ثم يراجع المطور التفاصيل ويضبط الدومين والاستضافة خلال 24–48 ساعة."
              : "Launch 70% of your store immediately with a template, brand identity, and products. A developer then reviews the details and configures the domain and hosting within 24–48 hours."}
          </p>
        </header>
        <section className="account-profile-card">
          <BrandLogo className="account-brand-watermark" size={120} variant="watermark" />
          <div>
            <BrandLogo className="account-profile-logo" size={46} showArabicSubtitle={false} variant="horizontal" />
            <h2>{isArabic ? "ملفي الشخصي" : "My profile"}</h2>
            {user ? (
              <>
                <p>{user.name}</p>
                <span dir="ltr">{user.email}</span>
              </>
            ) : (
              <p>{isArabic ? "لم تسجل الدخول بعد." : "You are not signed in."}</p>
            )}
          </div>
          <span className="account-google-status">
            {isArabic ? "ربط الحساب بجوجل — مهيأ للتفعيل" : "Google account connection — ready to enable"}
          </span>
        </section>
        <section className="account-theme-card">
          <div>
            <h2>{isArabic ? "مظهر المنصة" : "Platform appearance"}</h2>
            <p>{isArabic ? "يُحفظ اختيارك تلقائياً على هذا الجهاز." : "Your preference is saved on this device."}</p>
          </div>
          <AccountThemeToggle locale={locale} />
        </section>
        <TwoFactorSettings enabled={user?.twoFactorEnabled ?? false} locale={locale} />
        <div className="account-path-grid">
          <article className="account-path-card">
            <span className="eyebrow">{isArabic ? "الخيار الأول" : "Path A"}</span>
            <h2>{isArabic ? "أنشئ متجرك بنفسك الآن" : "Build your store yourself"}</h2>
            <p>
              {isArabic
                ? "أنشئ 70% من متجرك فوراً باختيار القالب ورفع الشعار والألوان والمنتجات الأولية؛ ثم يراجع المطور النسخة ويؤكد التسليم خلال 24–48 ساعة."
                : "Generate 70% of your store immediately with a template, logo, colors, and initial products; the developer then reviews and confirms delivery within 24–48 hours."}
            </p>
            <Link className="button-link" href={createStoreHref}>{isArabic ? "ابدأ إعداد المتجر" : "Start store setup"}</Link>
          </article>
          <article className="account-path-card">
            <span className="eyebrow">{isArabic ? "الخيار الثاني" : "Path B"}</span>
            <h2>{isArabic ? "اطلب من المطور تنفيذ وإدارة متجرك بالكامل" : "Have the developer build and manage your store"}</h2>
            <p>
              {isArabic
                ? "الـ30% الأخيرة تشمل مراجعة المطور وتظبيط التفاصيل البصرية وإعداد الدومين والاستضافة، على المنصة أو استضافتك الخاصة، خلال 24–48 ساعة."
                : "The final 30% covers developer review, visual refinement, and domain/hosting setup—on the platform or your own hosting—within 24–48 hours."}
            </p>
            <a className="button-link secondary" href="https://wa.me/201145335168" rel="noreferrer" target="_blank">
              {isArabic ? "تواصل عبر واتساب" : "Contact us on WhatsApp"}
            </a>
          </article>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
