import Link from "next/link";

type LocaleSwitchProps = {
  locale: "ar" | "en";
  basePath: string;
};

export function LocaleSwitch({ locale, basePath }: LocaleSwitchProps) {
  return (
    <nav aria-label={locale === "ar" ? "اختيار اللغة" : "Choose language"} className="locale-switch">
      <Link
        href={`${basePath}?lang=ar`}
        lang="ar"
        aria-current={locale === "ar" ? "page" : undefined}
      >
        عربي
      </Link>
      <Link
        href={`${basePath}?lang=en`}
        lang="en"
        aria-current={locale === "en" ? "page" : undefined}
      >
        EN
      </Link>
    </nav>
  );
}
