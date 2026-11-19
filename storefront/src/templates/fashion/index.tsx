"use client";

import { useState } from "react";
import type { TemplateModuleProps } from "../types";

export const fashionTemplate = {
  id: "fashion",
  accent: "#D4AF37",
  surface: "#121212",
  Details({ locale }: TemplateModuleProps) {
    const [color, setColor] = useState("sand");
    const [size, setSize] = useState("M");
    const sizes = ["S", "M", "L", "XL"];

    return (
      <section className="template-details template-details-fashion">
        <div className="template-swatches" aria-label={locale === "ar" ? "اختيار اللون" : "Color options"}>
          <strong>{locale === "ar" ? "اختاري اللون" : "Choose a color"}</strong>
          {[
            ["sand", "#D7C2A3"],
            ["rose", "#A45B62"],
            ["ink", "#292929"],
          ].map(([name, value]) => (
            <button
              aria-label={name}
              aria-pressed={color === name}
              key={name}
              onClick={() => setColor(name)}
              style={{ backgroundColor: value }}
              type="button"
            />
          ))}
        </div>
        <div className="template-size-options" aria-label={locale === "ar" ? "اختيار المقاس" : "Choose a size"}>
          {sizes.map((item) => (
            <button aria-pressed={size === item} key={item} onClick={() => setSize(item)} type="button">{item}</button>
          ))}
        </div>
        <details className="template-size-guide">
          <summary>{locale === "ar" ? "اعرفي مقاسك" : "Find your size"}</summary>
          <p>{locale === "ar" ? "يرجى مراجعة جدول المقاسات قبل إتمام الطلب." : "Check the size chart before placing an order."}</p>
        </details>
      </section>
    );
  },
} as const;
