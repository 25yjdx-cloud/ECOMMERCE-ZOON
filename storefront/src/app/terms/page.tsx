import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";

export default async function TermsPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();

  return (
    <div lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/terms" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="page-shell policy-page">
        <h1>{isArabic ? "شروط الاستخدام" : "Terms of use"}</h1>
        {isArabic ? (
          <>
            <p>استخدم CommerceForge بطريقة قانونية وبما يحترم حقوق أصحاب المتاجر والعملاء.</p>
            <p>التاجر مسؤول عن محتوى متجره وبيانات المنتجات والطلبات، وعن تهيئة النطاق والخدمات الخارجية المطلوبة للنشر.</p>
            <p>قد تتطلب بعض خدمات النشر والدعم باقات ورسوم تنفيذ موضحة قبل تفعيلها.</p>
          </>
        ) : (
          <>
            <p>Use CommerceForge lawfully and respect the rights of store owners and customers.</p>
            <p>Merchants are responsible for store content, product and order data, and configuring external domains and services required for publishing.</p>
            <p>Some publishing and support services may require plans and implementation fees disclosed before activation.</p>
          </>
        )}
        <Link href={`/#contact`}>{isArabic ? "اطلب عرض سعر" : "Request a quote"}</Link>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
