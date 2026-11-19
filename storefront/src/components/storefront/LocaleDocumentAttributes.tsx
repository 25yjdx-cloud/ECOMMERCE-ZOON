"use client";

import { useEffect } from "react";
import type { MockLocale } from "@/mock/types";

export function LocaleDocumentAttributes({ locale }: { locale: MockLocale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("commerceforge-locale", locale);
  }, [locale]);

  return null;
}
