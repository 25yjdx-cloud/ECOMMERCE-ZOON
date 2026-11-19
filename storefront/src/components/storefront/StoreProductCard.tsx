"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatEGP } from "@/i18n/format";
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
}: {
  product: MockProduct;
  preset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
  onAdded: () => void;
}) {
  const { addItem } = useCart();
  const productHref = createLocaleHref(`/preview/${preset.id}/product/${product.id}`, { lang: locale }, locale);

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
          <strong>{formatEGP(product.price, locale)}</strong>
          {product.compareAtPrice && <del>{formatEGP(product.compareAtPrice, locale)}</del>}
        </div>
        <button
          className="button-link"
          onClick={() => {
            addItem(product);
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
