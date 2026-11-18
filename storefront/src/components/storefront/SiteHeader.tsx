import Link from "next/link";
import { LocaleSwitch } from "./LocaleSwitch";

type SiteHeaderProps = {
  locale: "ar" | "en";
  basePath: string;
  storeName?: string;
};

export function SiteHeader({ locale, basePath, storeName }: SiteHeaderProps) {
  const isArabic = locale === "ar";

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label={isArabic ? "CommerceForge الرئيسية" : "CommerceForge home"}>
        <span aria-hidden="true" className="brand-symbol">C</span>
        <span>{storeName ?? "CommerceForge"}</span>
      </Link>
      <nav aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"} className="header-links">
        <Link className="text-link" href="/gallery">{isArabic ? "كل القوالب" : "All presets"}</Link>
        <LocaleSwitch locale={locale} basePath={basePath} />
      </nav>
    </header>
  );
}
