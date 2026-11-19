"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const stored = window.localStorage.getItem("commerceforge-locale");
    const locale = requested === "en" || (requested !== "ar" && stored === "en") ? "en" : "ar";

    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("commerceforge-locale", locale);
    window.dispatchEvent(new Event("commerceforge:locale-change"));
  }, [pathname]);

  return null;
}
