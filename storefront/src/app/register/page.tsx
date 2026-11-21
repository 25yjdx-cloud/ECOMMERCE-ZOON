import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { LoginForm } from "@/components/auth/LoginForm";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser, safeInternalRedirect } from "@/lib/auth";
import { getPostLoginPath } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "إنشاء حساب | CommerceForge",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<QueryValues>;
}) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();
  const redirectParam = Array.isArray(query.redirect) ? query.redirect[0] : query.redirect;
  const redirectTo = safeInternalRedirect(
    redirectParam ?? null,
    `/launch?lang=${locale}`,
  );

  if (user) {
    redirect(getPostLoginPath(user));
  }

  const dictionary = getDictionary(locale);
  const plan = Array.isArray(query.plan) ? query.plan[0] : query.plan;

  return (
    <main className="auth-page" lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/register" dictionary={dictionary} locale={locale} query={query} user={null} />
      <section className="auth-content page-shell">
        <div className="auth-intro">
          <p className="auth-brand-title">{isArabic ? "حساب CommerceForge" : "CommerceForge Account"}</p>
          <h1 className="auth-welcome-title">{isArabic ? "أنشئ حسابك وابدأ متجرك" : "Create your account and start your store"}</h1>
          <p>
            {isArabic
              ? "أكمل بياناتك أو تابع باستخدام Google، ثم ابدأ تجربتك المجانية لمدة 14 يوم."
              : "Enter your details or continue with Google, then start your 14-day free trial."}
          </p>
        </div>
        <LoginForm
          backendConfigured={Boolean(process.env.BAGISTO_API_URL)}
          firebaseConfig={
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY
            && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
            && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
              ? {
                  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
                }
              : null
          }
          googleEnabled={process.env.GOOGLE_OAUTH_ENABLED === "true"}
          initialMode="register"
          locale={locale}
          plan={plan ?? null}
          redirectTo={redirectTo}
        />
      </section>
      <Footer locale={locale} />
    </main>
  );
}
