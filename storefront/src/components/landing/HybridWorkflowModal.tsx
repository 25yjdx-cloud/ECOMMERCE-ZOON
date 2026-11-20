"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import type { MockLocale } from "@/mock/types";

const OPEN_EVENT = "commerceforge:open-hybrid";

export function HybridWorkflowModal() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<MockLocale>("ar");

  useEffect(() => {
    const openModal = (event: Event) => {
      const selectedLocale = (event as CustomEvent<unknown>).detail;
      if (selectedLocale === "ar" || selectedLocale === "en") setLocale(selectedLocale);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, openModal);
    return () => window.removeEventListener(OPEN_EVENT, openModal);
  }, []);

  if (!open) return null;

  return (
    <div
      className="hybrid-modal-backdrop"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <section
        aria-labelledby="hybrid-modal-title"
        aria-modal="true"
        className="hybrid-modal"
        dir={locale === "ar" ? "rtl" : "ltr"}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label={locale === "ar" ? "إغلاق" : "Close"} className="hybrid-modal-close" onClick={() => setOpen(false)} type="button">×</button>
        <BrandLogo size={52} variant="mark" />
        <span className="eyebrow">{locale === "ar" ? "نموذج الإطلاق 70% / 30%" : "The 70% / 30% launch model"}</span>
        <h2 id="hybrid-modal-title">{locale === "ar" ? "من الفكرة إلى الإطلاق بخطوات واضحة" : "A clear path from idea to launch"}</h2>
        <div className="hybrid-modal-phases">
          <article>
            <strong>{locale === "ar" ? "70% انطلاق فوري (في 5 دقائق)" : "70% instant setup (in 5 minutes)"}</strong>
            <p>{locale === "ar" ? "اختر القالب، ارفع شعارك، حدد ألوان علامتك، وأضف منتجاتك الأولى تلقائياً." : "Choose a template, upload your logo, pick brand colors, and add initial products automatically."}</p>
          </article>
          <article>
            <strong>{locale === "ar" ? "30% لمسة وتأكيد المطور (خلال 24–48 ساعة)" : "30% developer review and confirmation (within 24–48 hours)"}</strong>
            <p>{locale === "ar" ? "يراجع المطور التصميم، يجهز النطاق والاستضافة، ويتحقق من إعدادات الدفع والشحن قبل تأكيد الإطلاق." : "The developer reviews the design, configures domain and hosting, and verifies payment and shipping settings before confirming launch."}</p>
          </article>
        </div>
        <div className="hybrid-modal-actions">
          <Link className="button-link" href={`/launch?lang=${locale}`} onClick={() => setOpen(false)}>
            {locale === "ar" ? "ابدأ الـ 70% الآن (تجربة 14 يوم مجاناً) ←" : "Start your 70% now (14-day free trial) →"}
          </Link>
          <a className="button-link secondary" href="https://wa.me/201145335168" rel="noreferrer" target="_blank">
            {locale === "ar" ? "تواصل مع المطور عبر واتساب" : "Contact the developer on WhatsApp"}
          </a>
        </div>
      </section>
    </div>
  );
}

export function OpenHybridWorkflowButton({ children, locale }: { children: React.ReactNode; locale: MockLocale }) {
  return (
    <button
      className="cf-hero-pill"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: locale }))}
      type="button"
    >
      <span className="cf-hero-pill-dot" aria-hidden="true" />
      {children}
      <span aria-hidden="true">ⓘ</span>
    </button>
  );
}
