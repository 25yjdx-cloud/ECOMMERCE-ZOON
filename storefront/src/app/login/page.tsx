import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getAuthUser, safeInternalRedirect } from "@/lib/auth";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const metadata: Metadata = {
  title: "تسجيل الدخول | CommerceForge",
  robots: { index: false, follow: false },
};

type LoginPageProps = { searchParams: Promise<QueryValues> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const user = await getAuthUser();
  const redirectParam = Array.isArray(query.redirect) ? query.redirect[0] : query.redirect;
  const notice = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const template = Array.isArray(query.template) ? query.template[0] : query.template;
  const redirectTo = safeInternalRedirect(
    redirectParam ?? null,
    user?.role === "super_admin"
      ? "/manager/classic"
      : template
        ? `/launch?template=${encodeURIComponent(template)}&lang=${locale}`
        : "/dashboard/my-store",
  );

  if (user && !(user.role === "merchant" && notice === "owner-only")) {
    redirect(user.role === "super_admin"
      ? redirectTo
      : user.storeSlug || !redirectTo.startsWith("/launch")
        ? "/dashboard/my-store"
        : redirectTo);
  }

  const plan = Array.isArray(query.plan) ? query.plan[0] : query.plan;
  const oauthComplete = Array.isArray(query.oauth) ? query.oauth[0] : query.oauth;
  const isArabic = locale === "ar";
  const dictionary = getDictionary(locale);

  return (
    <main className="auth-page" lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/login" dictionary={dictionary} locale={locale} query={query} user={user} />
      <section className="auth-content page-shell">
        <div className="auth-intro">
          <span className="eyebrow">{isArabic ? "حساب CommerceForge" : "CommerceForge account"}</span>
          <h1>{isArabic ? "أهلاً بك" : "Welcome back"}</h1>
          <p>
            {isArabic
              ? "سجّل الدخول للمتابعة. صلاحيات إدارة المنصة محصورة بالبريد المحدد في إعدادات المالك."
              : "Sign in to continue. Platform administration is restricted to the configured owner email."}
          </p>
          {notice === "owner-only" && (
            <p className="auth-notice" role="status">
              {isArabic ? "هذه الصفحة مخصصة لإدارة المنصة فقط" : "This page is for platform administration only."}
            </p>
          )}
          {oauthComplete === "success" && (
            <p className="auth-notice" role="status">
              {isArabic ? "تم تسجيل الدخول بحساب Google." : "Google sign-in completed."}
            </p>
          )}
          {notice === "backend-unavailable" && (
            <p className="auth-notice" role="status">
              {isArabic ? "خدمة تسجيل الدخول غير متاحة حالياً." : "The sign-in service is currently unavailable."}
            </p>
          )}
        </div>
        {user?.role === "merchant" ? (
          <div className="auth-card">
            <p className="auth-notice" role="status">
              {isArabic ? "هذه الصفحة مخصصة لإدارة المنصة فقط" : "This page is for platform administration only."}
            </p>
            <Link className="button-link auth-submit" href={`/dashboard/my-store?lang=${locale}`}>
              {isArabic ? "الانتقال إلى متجري" : "Go to my store"}
            </Link>
          </div>
        ) : (
          <LoginForm
            backendConfigured={Boolean(process.env.BAGISTO_API_URL)}
            googleEnabled={process.env.GOOGLE_OAUTH_ENABLED === "true"}
            firebaseConfig={
              process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
              process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
              process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
                ? {
                    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                  }
                : null
            }
            locale={locale}
            plan={plan ?? null}
            redirectTo={redirectTo}
          />
        )}
      </section>
    </main>
  );
}
