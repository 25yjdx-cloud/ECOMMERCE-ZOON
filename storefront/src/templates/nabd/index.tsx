"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const nabdTemplate = {
  id: "nabd",
  accent: "#B8F226",
  surface: "#0D0D0D",
  Details({ locale }: TemplateModuleProps) {
    const goals = locale === "ar" ? ["قوة", "جري", "لياقة"] : ["Strength", "Running", "Fitness"];
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
          {[1, 2, 3].map((number) => <span key={number}><b>{number}</b>{locale === "ar" ? "اختيار رياضي" : "Training pick"}</span>)}
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
