import type { MockLocale, MockProduct } from "@/mock/types";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type ProductPlaceholderProps = {
  locale: MockLocale;
  product: MockProduct;
};

export function ProductPlaceholder({ locale, product }: ProductPlaceholderProps) {
  const isArabic = locale === "ar";

  return (
    <article className="product-card">
      <div
        className="product-placeholder"
        role="img"
        aria-label={isArabic ? "صورة توضيحية مؤقتة" : "Placeholder image"}
      >
        <strong aria-hidden="true">{product.name[locale].slice(0, 1)}</strong>
        <span>{isArabic ? "صورة مؤقتة" : "Placeholder image"}</span>
      </div>
      <div className="product-info">
        <p>{product.category[locale]}</p>
        <h3>{product.name[locale]}</h3>
        <p>{product.description[locale]}</p>
        <strong>{product.price.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} {isArabic ? "ج.م" : "EGP"}</strong>
        <AddToCartButton locale={locale} product={product} />
      </div>
    </article>
  );
}
