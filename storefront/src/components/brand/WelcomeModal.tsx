"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";

const WELCOME_KEY = "cf_welcome_seen";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<"ar" | "en">("ar");

  useEffect(() => {
    const syncLocale = () => setLocale(document.documentElement.lang === "en" ? "en" : "ar");
    syncLocale();
    window.addEventListener("commerceforge:locale-change", syncLocale);
    const timer = window.setTimeout(() => {
      if (window.sessionStorage.getItem(WELCOME_KEY) === null) {
        window.sessionStorage.setItem(WELCOME_KEY, "1");
        setOpen(true);
      }
    }, 1650);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("commerceforge:locale-change", syncLocale);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function dismiss() {
    window.sessionStorage.setItem(WELCOME_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;
  const isArabic = locale === "ar";

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 welcome-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgb(0 0 0 / 50%)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
    >
      <section
        aria-labelledby="welcome-title"
        aria-modal="true"
        className="welcome-modal"
        dir={isArabic ? "rtl" : "ltr"}
        role="dialog"
      >
        <button aria-label={isArabic ? "إغلاق" : "Close"} className="welcome-close" onClick={dismiss} type="button">×</button>
        <BrandLogo size={64} variant="full" />
        <span className="eyebrow">{isArabic ? "أهلاً بك" : "Welcome"}</span>
        <h2 id="welcome-title">
          {isArabic ? "70% إطلاق فوري، و30% لمسة المطور النهائية" : "70% instant launch, 30% developer polish"}
        </h2>
        <p>
          {isArabic
            ? "اختر قالبك وأضف الهوية والمنتجات. بعدها يراجع المطور التفاصيل ويضبط الدومين والاستضافة خلال 24–48 ساعة."
            : "Choose a template, add your brand and products, then a developer reviews the details and configures your domain and hosting within 24–48 hours."}
        </p>
        <div className="welcome-actions">
          <Link className="button-link" href={`/templates?lang=${locale}`} onClick={dismiss}>
            {isArabic ? "استكشف القوالب" : "Explore templates"}
          </Link>
          <button className="button-link secondary" onClick={dismiss} type="button">
            {isArabic ? "متابعة التصفح" : "Continue browsing"}
          </button>
        </div>
      </section>
    </div>
  );
}
