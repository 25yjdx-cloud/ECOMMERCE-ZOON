"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<"ar" | "en">("ar");

  useEffect(() => {
    const syncLocale = () => setLocale(document.documentElement.lang === "en" ? "en" : "ar");
    syncLocale();
    window.addEventListener("commerceforge:locale-change", syncLocale);
    return () => window.removeEventListener("commerceforge:locale-change", syncLocale);
  }, []);

  const isArabic = locale === "ar";
  return (
    <main className="brand-system-page" dir={isArabic ? "rtl" : "ltr"} lang={locale}>
      <BrandLogo size={68} variant="full" />
      <span className="eyebrow">CommerceForge</span>
      <h1>{isArabic ? "حدث خطأ غير متوقع" : "Something went wrong"}</h1>
      <p>{isArabic ? "لم نتمكن من إكمال طلبك. حاول مرة أخرى أو ارجع للرئيسية." : "We could not complete that request. Try again or return home."}</p>
      <div className="welcome-actions">
        <button className="button-link" onClick={reset} type="button">{isArabic ? "حاول مرة أخرى" : "Try again"}</button>
        <Link className="button-link secondary" href="/">{isArabic ? "الرئيسية" : "Home"}</Link>
      </div>
    </main>
  );
}
