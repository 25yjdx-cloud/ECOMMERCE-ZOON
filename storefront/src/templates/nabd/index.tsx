"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const nabdTemplate = {
  id: "nabd",
  accent: "#B8F226",
  surface: "#0D0D0D",
  Details({ locale, store }: TemplateModuleProps) {
    const goals = store.categories.length
      ? store.categories.map((category) => category[locale])
      : locale === "ar" ? ["قوة", "جري", "لياقة"] : ["Strength", "Running", "Fitness"];
    const [goalIndex, setGoalIndex] = useState(0);

    return (
      <section className="template-details template-details-nabd">
        <div className="template-goals" aria-label={locale === "ar" ? "اختر هدفك" : "Choose your goal"}>
          <strong>{locale === "ar" ? "اختار هدفك" : "Choose your goal"}</strong>
          {goals.map((item, index) => (
            <button aria-pressed={goalIndex === index} key={item} onClick={() => setGoalIndex(index)} type="button">{item}</button>
          ))}
        </div>
        <div className="template-ranking" aria-label={locale === "ar" ? "الأكثر طلباً" : "Top picks"}>
          {store.products.slice(0, 3).map((product, index) => (
            <span key={product.id}>
              <b>{index + 1}</b>
              {product.name[locale]} · {new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
                style: "currency",
                currency: store.currency,
                maximumFractionDigits: 0,
              }).format(product.price)}
            </span>
          ))}
          {store.products.length === 0 && <span>{locale === "ar" ? "أضف المنتجات لعرضها هنا." : "Add products to feature them here."}</span>}
        </div>
        <details className="template-size-guide">
          <summary>{locale === "ar" ? "اعرف مقاسك" : "Find your size"}</summary>
          <p>{locale === "ar" ? "دليل مقاسات تجريبي للمعاينة." : "Sample size guide for preview."}</p>
          <div>{["S", "M", "L", "XL", "XXL"].map((size) => <span key={size}>{size}</span>)}</div>
        </details>
      </section>
    );
  },
} as const;
