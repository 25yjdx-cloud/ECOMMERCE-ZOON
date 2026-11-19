import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const user = await getAuthUser();

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/notifications" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="page-shell notification-page">
        <NotificationCenter locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
