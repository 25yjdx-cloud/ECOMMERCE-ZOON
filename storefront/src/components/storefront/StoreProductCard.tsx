"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import type { MockLocale, MockProduct } from "@/mock/types";
import { createLocaleHref } from "@/i18n/locale";
import { ProductArtwork } from "./ProductArtwork";

export function StoreProductCard({
  product,
  preset,
  locale,
  dictionary,
  onAdded,
  currency,
  isLiveStore = false,
  storeSlug = product.storeSlug,
}: {
  product: MockProduct;
  preset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
  onAdded: () => void;
  currency: "EGP" | "SAR";
  isLiveStore?: boolean;
  storeSlug?: string;
}) {
  const { addItem } = useCart();
  const productHref = createLocaleHref(
    isLiveStore && storeSlug
      ? `/s/${encodeURIComponent(storeSlug)}/product/${encodeURIComponent(product.id)}`
      : `/preview/${preset.id}/product/${product.id}`,
    { lang: locale, ...(storeSlug ? { store: storeSlug } : {}) },
    locale,
  );
  const cartProduct = storeSlug ? { ...product, storeSlug } : product;
  const formattedPrice = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <article className="product-card">
      <Link
        aria-label={`${dictionary.store.details}: ${product.name[locale]}`}
        className="product-placeholder"
        href={productHref}
      >
        <ProductArtwork preset={preset.id} productId={product.id} />
        <span className="visually-hidden">{dictionary.store.placeholder}</span>
      </Link>
      <div className="product-info">
        <span className="product-badge">{product.badge?.[locale] ?? dictionary.gallery.badgeNew}</span>
        <p>{product.category[locale]}</p>
        <h3>
          <Link href={productHref}>{product.name[locale]}</Link>
        </h3>
        <p>{product.description[locale]}</p>
        <div className="product-price-row">
          <strong>{formattedPrice.format(product.price)}</strong>
          {product.compareAtPrice && <del>{formattedPrice.format(product.compareAtPrice)}</del>}
        </div>
        <button
          className="button-link"
          onClick={() => {
            addItem(cartProduct);
            onAdded();
          }}
          type="button"
        >
          {dictionary.store.addToCart}
        </button>
      </div>
    </article>
  );
}
