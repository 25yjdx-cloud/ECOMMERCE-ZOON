import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

type LandingHeaderProps = {
  locale: MockLocale;
  dictionary: Dictionary;
  user: AuthUser | null;
  basePath?: string;
};

export function LandingHeader({ locale, dictionary, user, basePath = "/" }: LandingHeaderProps) {
  const nav = dictionary.navigation;
  const withLocale = (path: string) => {
    const [pathname, hash] = path.split("#", 2);
    const separator = pathname.includes("?") ? "&" : "?";
    return `${pathname}${separator}lang=${locale}${hash ? `#${hash}` : ""}`;
  };
  const languageHref = (language: MockLocale) =>
    `${basePath}${basePath.includes("?") ? "&" : "?"}lang=${language}`;
  const accountHref = user?.role === "super_admin"
    ? withLocale("/manager/classic")
    : user?.role === "merchant"
      ? withLocale("/dashboard/my-store")
      : withLocale("/login");

  return (
    <header className="site-header landing-nav">
      <Link className="brand-mark" href={withLocale("/")} aria-label="CommerceForge">
        <span aria-hidden="true" className="brand-symbol">
          <svg fill="none" viewBox="0 0 32 32">
            <path d="M5 26V15.5C5 9.7 9.7 5 15.5 5h1C22.3 5 27 9.7 27 15.5V26" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
            <path d="M10 26V16a6 6 0 0 1 12 0v10M15 26V16a1 1 0 0 1 2 0v10" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </span>
        <span>CommerceForge</span>
      </Link>
      <nav aria-label={nav.presets} className="header-links">
        <Link className="text-link" href={withLocale("/gallery")}>{nav.presets}</Link>
        <Link className="text-link" href={withLocale("/#features")}>{nav.features}</Link>
        <Link className="text-link" href={withLocale("/#pricing")}>{nav.pricing}</Link>
        {user?.role === "super_admin" && (
          <Link className="text-link" href={accountHref}>{nav.platformManager}</Link>
        )}
        {user?.role === "merchant" && (
          <Link className="text-link" href={accountHref}>{nav.myStore}</Link>
        )}
        {!user && <Link className="text-link" href={withLocale("/login")}>{nav.login}</Link>}
        <Link className="button-link" href={withLocale("/preview/fashion")}>{nav.livePreview}</Link>
        {user && <LogoutButton label={nav.logout} locale={locale} />}
        <div className="locale-switch" aria-label={nav.languageEnglish}>
          <Link aria-current={locale === "ar" ? "page" : undefined} href={languageHref("ar")}>{nav.languageArabic}</Link>
          <Link aria-current={locale === "en" ? "page" : undefined} href={languageHref("en")}>{nav.languageEnglish}</Link>
        </div>
      </nav>
    </header>
  );
}
