import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();

  return (
    <div lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/privacy" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="page-shell policy-page">
        <h1>{isArabic ? "سياسة الخصوصية" : "Privacy policy"}</h1>
        {isArabic ? (
          <>
            <p>نستخدم بيانات الحساب والمتجر لتقديم خدمات CommerceForge وتشغيل لوحة المتجر التي يملكها المستخدم.</p>
            <p>تُعزل بيانات كل متجر عن حسابات التجار الأخرى، ولا تُعرض بيانات الاعتماد أو الأسرار في واجهة المتجر.</p>
            <p>يمكن التواصل مع فريقنا لطلب تصحيح بيانات الحساب أو الاستفسار عن حذفها.</p>
          </>
        ) : (
          <>
            <p>Account and store data are used to provide CommerceForge and operate the store dashboard owned by the account holder.</p>
            <p>Each store is isolated from other merchants, and credentials or secrets are never displayed in the storefront.</p>
            <p>Contact our team to request account-data correction or ask about deletion.</p>
          </>
        )}
        <Link href={`/#contact`}>{isArabic ? "تواصل معنا" : "Contact us"}</Link>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
