import type { CSSProperties } from "react";
import { getThemeTokens, toThemeStyle } from "@/config/theme-tokens";
import type { MockLocale } from "@/mock/types";
import { mockData } from "@/mock";
import type { Preset } from "@/lib/presets";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { SiteHeader } from "./SiteHeader";

type StorePreviewProps = {
  locale: MockLocale;
  preset: Preset;
};

export function StorePreview({ locale, preset }: StorePreviewProps) {
  const isArabic = locale === "ar";
  const data = mockData[preset.id];
  const tokens = getThemeTokens(preset.id);
  const style = toThemeStyle(tokens) as CSSProperties;

  return (
    <div className="storefront" style={style} lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <div className="page-shell">
        <SiteHeader locale={locale} basePath={`/preview/${preset.id}`} storeName={preset.name[locale]} />
        <main>
          <section className="storefront-hero" aria-labelledby="store-title">
            <span className="eyebrow">{isArabic ? "معاينة تجريبية للقالب" : "Preset preview"}</span>
            <h1 id="store-title">
              {isArabic ? `مساحة ${preset.name.ar} الخاصة بك` : `Your ${preset.name.en} space`}
            </h1>
            <p>
              {isArabic
                ? "تجربة متجر توضيحية ببيانات وعناصر مؤقتة. الألوان والخطوط تتغير حسب القالب."
                : "A demo storefront with mock data and placeholder visuals. Colors and fonts change with the preset."}
            </p>
            <span className="mock-label">{isArabic ? "بيانات تجريبية — ليست للبيع" : "MOCK DATA — NOT FOR SALE"}</span>
          </section>

          <section className="storefront-section" aria-labelledby="categories-title">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{isArabic ? "تصفح حسب القسم" : "Browse by category"}</span>
                <h2 id="categories-title">{isArabic ? "أقسام مختارة" : "Featured categories"}</h2>
              </div>
            </div>
            <ul className="category-list">
              {data.categories.map((category) => (
                <li className="category-chip" key={category.en}>{category[locale]}</li>
              ))}
            </ul>
          </section>

          <section className="storefront-section" aria-labelledby="products-title">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{isArabic ? "اختيارات المتجر" : "The collection"}</span>
                <h2 id="products-title">{isArabic ? "منتجات تجريبية" : "Demo products"}</h2>
              </div>
            </div>
            <div className="product-grid">
              {data.products.map((product) => (
                <ProductPlaceholder key={product.id} locale={locale} product={product} />
              ))}
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <span>{isArabic ? "© معاينة CommerceForge" : "© CommerceForge preview"}</span>
          <span>{isArabic ? "كل الصور والمنتجات هنا مؤقتة" : "All images and products here are placeholders"}</span>
        </footer>
      </div>
    </div>
  );
}
