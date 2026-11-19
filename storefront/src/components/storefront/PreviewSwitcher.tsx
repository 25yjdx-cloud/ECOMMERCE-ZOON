"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { Preset } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale } from "@/mock/types";

export function PreviewSwitcher({
  presets,
  activePreset,
  locale,
  dictionary,
  pathname,
  query,
  productDetail = false,
}: {
  presets: readonly Preset[];
  activePreset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
  pathname: string;
  query: QueryValues;
  productDetail?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const targetUrl = (preset: Preset) => {
    const productPath = productDetail ? `/product/${mockData[preset.id].products[0].id}` : "";
    return createLocaleHref(`/preview/${preset.id}${productPath}`, query, locale);
  };
  const languageUrl = (nextLocale: MockLocale) => createLocaleHref(pathname, query, nextLocale);

  return visible ? (
    <nav aria-label={dictionary.store.switchPreset} className="preview-switcher">
      {presets.map((preset) => (
        <Link
          aria-current={preset.id === activePreset.id ? "page" : undefined}
          href={targetUrl(preset)}
          key={preset.id}
        >
          {preset.name[locale]}
        </Link>
      ))}
      <Link aria-current={locale === "ar" ? "page" : undefined} href={languageUrl("ar")}>
        {dictionary.navigation.languageArabic}
      </Link>
      <Link aria-current={locale === "en" ? "page" : undefined} href={languageUrl("en")}>
        {dictionary.navigation.languageEnglish}
      </Link>
      <button
        aria-label={locale === "ar" ? "إخفاء مبدل القوالب" : "Hide template switcher"}
        className="preview-switcher-close"
        onClick={() => setVisible(false)}
        type="button"
      >
        ×
      </button>
    </nav>
  ) : (
    <button
      className="preview-switcher-reopen"
      onClick={() => setVisible(true)}
      type="button"
    >
      {locale === "ar" ? "تبديل القالب" : "Switch template"}
    </button>
  );
}
