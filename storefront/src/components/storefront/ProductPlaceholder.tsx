import type { MockLocale, MockProduct } from "@/mock/types";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getPreset } from "@/lib/presets";
import { formatEGP } from "@/i18n/format";
import { ProductArtwork } from "./ProductArtwork";

type ProductPlaceholderProps = {
  locale: MockLocale;
  product: MockProduct;
};

export function ProductPlaceholder({ locale, product }: ProductPlaceholderProps) {
  const preset = getPreset(product.preset);
  if (!preset) {
    throw new Error(`Unknown preset for product ${product.id}.`);
  }

  return (
    <article className="product-card" data-preset={preset.id}>
      <div aria-label={product.name[locale]} className="product-placeholder">
        <ProductArtwork preset={preset.id} productId={product.id} />
      </div>
      <div className="product-info">
        <p>{product.category[locale]}</p>
        <h3>{product.name[locale]}</h3>
        <p>{product.description[locale]}</p>
        <strong>{formatEGP(product.price, locale)}</strong>
        <AddToCartButton locale={locale} product={product} />
      </div>
    </article>
  );
}
