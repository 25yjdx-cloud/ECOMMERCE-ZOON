import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PricingSection } from "@/components/landing/PricingSection";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getAuthUser } from "@/lib/auth";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "الباقات والأسعار | CommerceForge",
};

export default async function PricingPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const dictionary = getDictionary(locale);
  const user = await getAuthUser();

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/pricing" dictionary={dictionary} locale={locale} query={query} user={user} />
      <main>
        <PricingSection content={dictionary.pricing} locale={locale} user={user} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
