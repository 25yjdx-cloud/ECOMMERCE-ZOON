import type { Metadata } from "next";
import Link from "next/link";
import { AccountThemeToggle } from "@/components/theme/AccountThemeToggle";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";

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
          <p>{isArabic ? "تحكم في حسابك واختر الطريقة الأنسب لإطلاق متجرك." : "Manage your account and choose how to launch your store."}</p>
        </header>
        <section className="account-profile-card">
          <div>
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
        <div className="account-path-grid">
          <article className="account-path-card">
            <span className="eyebrow">{isArabic ? "الخيار الأول" : "Path A"}</span>
            <h2>{isArabic ? "أنشئ متجرك بنفسك الآن" : "Build your store yourself"}</h2>
            <p>{isArabic ? "اختر قالباً، أضف هوية متجرك، وابدأ بإدارة منتجاتك من لوحة مستقلة." : "Choose a template, add your branding, and manage products from your own dashboard."}</p>
            <Link className="button-link" href={createStoreHref}>{isArabic ? "ابدأ إعداد المتجر" : "Start store setup"}</Link>
          </article>
          <article className="account-path-card">
            <span className="eyebrow">{isArabic ? "الخيار الثاني" : "Path B"}</span>
            <h2>{isArabic ? "اطلب من المطور تنفيذ وإدارة متجرك بالكامل" : "Have the developer build and manage your store"}</h2>
            <p>
              {isArabic
                ? "تنفيذ مخصص، استضافة، نشر على دومينك الخاص، ومتابعة وإدارة مستمرة."
                : "Custom implementation, hosting, publishing on your domain, and ongoing management."}
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
