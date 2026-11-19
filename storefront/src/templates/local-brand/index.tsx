"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const localBrandTemplate = {
  id: "local-brand",
  accent: "#6D28D9",
  surface: "#F5F3FF",
  Details({ locale }: TemplateModuleProps) {
    const [bundle, setBundle] = useState("single");
    const isArabic = locale === "ar";

    return (
      <section className="template-details template-details-local">
        <div className="template-drop-banner">
          <strong>{isArabic ? "دفعة جديدة" : "New drop"}</strong>
          <span>{isArabic ? "منتجات محلية بإصدارات محدودة" : "Local pieces in limited releases"}</span>
        </div>
        <div className="template-stock-meter">
          <span>{isArabic ? "باقي 3 قطع" : "3 items left"}</span>
          <i><b /></i>
        </div>
        <div className="template-bundle-options" aria-label={isArabic ? "اختيار العرض" : "Bundle options"}>
          <button aria-pressed={bundle === "single"} onClick={() => setBundle("single")} type="button">
            {isArabic ? "قطعة واحدة" : "One item"}
          </button>
          <button aria-pressed={bundle === "bundle"} onClick={() => setBundle("bundle")} type="button">
            {isArabic ? "قطعتان — خصم 20٪" : "Two items — 20% off"}
          </button>
        </div>
        <small>{isArabic ? "اختيار عرض توضيحي؛ لا يُطبّق على السلة قبل ربط الدفع." : "Preview selection only; not applied to checkout until payments are connected."}</small>
      </section>
    );
  },
} as const;
