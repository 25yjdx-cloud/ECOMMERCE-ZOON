import type { TemplateModuleProps } from "../types";

export const classicTemplate = {
  id: "classic",
  accent: "#D97706",
  surface: "#FAF8F5",
  Details({ locale }: TemplateModuleProps) {
    const categories = locale === "ar"
      ? ["إكسسوارات", "هدايا", "ديكور وأدوات"]
      : ["Accessories", "Gifts", "Home decor"];

    return (
      <section className="template-details template-details-classic" aria-label={locale === "ar" ? "أقسام المتجر" : "Store categories"}>
        {categories.map((category, index) => (
          <a className="template-arch-card" href="#products" key={category}>
            <span>0{index + 1}</span>
            <strong>{category}</strong>
            <span aria-hidden="true">←</span>
          </a>
        ))}
      </section>
    );
  },
} as const;
