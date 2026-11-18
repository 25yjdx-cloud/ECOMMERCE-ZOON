import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";

type LandingHeaderProps = {
  locale: MockLocale;
  dictionary: Dictionary;
  basePath?: string;
};

export function LandingHeader({ locale, dictionary, basePath = "/" }: LandingHeaderProps) {
  const nav = dictionary.navigation;
  const languageHref = (language: MockLocale) =>
    `${basePath}${basePath.includes("?") ? "&" : "?"}lang=${language}`;

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="CommerceForge">
        <span aria-hidden="true" className="brand-symbol">C</span>
        <span>CommerceForge</span>
      </Link>
      <nav aria-label={nav.presets} className="header-links">
        <Link className="text-link" href="/gallery">{nav.presets}</Link>
        <a className="text-link" href="#how-it-works">{nav.howItWorks}</a>
        <a className="text-link" href="#contact">{nav.contact}</a>
        <Link className="button-link" href="/preview/fashion">{nav.livePreview}</Link>
        <div className="locale-switch" aria-label={nav.languageEnglish}>
          <Link aria-current={locale === "ar" ? "page" : undefined} href={languageHref("ar")}>{nav.languageArabic}</Link>
          <Link aria-current={locale === "en" ? "page" : undefined} href={languageHref("en")}>{nav.languageEnglish}</Link>
        </div>
      </nav>
    </header>
  );
}
