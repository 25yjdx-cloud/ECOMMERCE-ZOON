"use client";

import { useState, type FormEvent } from "react";
import type { MockLocale } from "@/mock/types";

const niches = {
  ar: ["ملابس شبابي", "أثاث مودرن", "عطور", "أدوات رياضية", "إلكترونيات", "هدايا"],
  en: ["Fashion", "Modern furniture", "Perfumes", "Sports gear", "Electronics", "Gifts"],
} satisfies Record<MockLocale, string[]>;

export function BusinessAdvisorCard({ locale }: { locale: MockLocale }) {
  const [business, setBusiness] = useState("");

  function askAdvisor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = business.trim();
    if (!prompt) return;
    window.dispatchEvent(new CustomEvent("commerceforge:ask-ai", { detail: prompt }));
    setBusiness("");
  }

  return (
    <div className="business-advisor-card" dir={locale === "ar" ? "rtl" : "ltr"}>
      <label htmlFor="business-advisor-input">
        {locale === "ar" ? "اكتب نشاط متجرك هنا" : "Describe your store"}
      </label>
      <form onSubmit={askAdvisor}>
        <input
          id="business-advisor-input"
          maxLength={300}
          onChange={(event) => setBusiness(event.target.value)}
          placeholder={locale === "ar"
            ? "مثال: ملابس شبابي، أثاث مودرن، عطور، أدوات رياضية"
            : "e.g. fashion, modern furniture, perfumes, sports gear"}
          value={business}
        />
        <button className="button-link" disabled={!business.trim()} type="submit">
          {locale === "ar" ? "اقترح لي القالب والهوية ←" : "Suggest a template and identity →"}
        </button>
      </form>
      <div className="business-advisor-tags">
        {niches[locale].map((niche) => (
          <button key={niche} onClick={() => setBusiness(niche)} type="button">{niche}</button>
        ))}
      </div>
    </div>
  );
}
