"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const localBrandTemplate = {
  id: "local-brand",
  accent: "#6D28D9",
  surface: "#F5F3FF",
  Details({ locale, store }: TemplateModuleProps) {
    const [bundle, setBundle] = useState("single");
    const isArabic = locale === "ar";
    const remaining = store.products.reduce((sum, product) => sum + Math.max(0, product.stockQty), 0);

    return (
      <section className="template-details template-details-local">
        <div className="template-drop-banner">
          <strong>{store.storeName || (isArabic ? "دفعة جديدة" : "New drop")}</strong>
          <span>{store.products.length
            ? isArabic ? `${store.products.length} منتجات متاحة الآن` : `${store.products.length} products available`
            : isArabic ? "أضف منتجاتك لعرضها هنا." : "Add products to feature them here."}</span>
        </div>
        <div className="template-stock-meter">
          <span>{isArabic ? `المخزون المتاح: ${remaining}` : `Available stock: ${remaining}`}</span>
          <i><b style={{ width: `${store.products.length ? Math.min(100, remaining * 5) : 0}%` }} /></i>
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
