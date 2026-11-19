"use client";

import Link from "next/link";
import { useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatEGP } from "@/i18n/format";
import type { QueryValues } from "@/i18n/locale";
import type { Preset } from "@/lib/presets";
import { presets } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale, MockProduct } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { createLocaleHref } from "@/i18n/locale";
import { LocaleDocumentAttributes } from "./LocaleDocumentAttributes";
import { PreviewSwitcher } from "./PreviewSwitcher";
import { PreviewTopbar } from "./PreviewTopbar";
import { ProductArtwork } from "./ProductArtwork";
import { StoreProductCard } from "./StoreProductCard";
import { templateModules } from "@/templates";

export function ProductDetail({
  product,
  preset,
  locale,
  dictionary,
  query,
  user,
}: {
  product: MockProduct;
  preset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
  query: QueryValues;
  user: AuthUser | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem, itemCount } = useCart();
  const related = mockData[preset.id].products.filter(({ id }) => id !== product.id).slice(0, 3);
  const storeName = dictionary.store.storeNames[preset.id];
  const store = dictionary.store;
  const template = templateModules[preset.id];

  return (
    <div
      className="storefront"
      data-preset={preset.id}
      data-template-module={template.id}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={{ accentColor: template.accent }}
    >
      <LocaleDocumentAttributes locale={locale} />
      <PreviewTopbar
        dictionary={dictionary}
        locale={locale}
        pathname={`/preview/${preset.id}/product/${product.id}`}
        preset={preset}
        query={query}
        user={user}
      />
      {preset.id === "nabd" && <div className="store-announcement">{store.nabdAnnouncement}</div>}
      <header className="store-topbar">
        <Link className="brand-mark" href={createLocaleHref(`/preview/${preset.id}`, query, locale)}>
          <span aria-hidden="true" className="brand-symbol">C</span>
          <span>{storeName}</span>
        </Link>
        <div className="store-topbar-actions">
          <Link className="button-link" href={createLocaleHref(`/preview/${preset.id}`, query, locale)}>{dictionary.navigation.storeHome}</Link>
          <button className="button-link" onClick={() => setCartOpen(true)} type="button">
            {store.cart} ({itemCount})
          </button>
        </div>
      </header>
      <main className="page-shell">
        <section className="detail-layout">
          <div aria-label={store.placeholder} className={`detail-art detail-art-${preset.id}`}>
            <ProductArtwork preset={preset.id} productId={product.id} />
          </div>
          <div className="detail-copy">
            <span className="eyebrow">{product.category[locale]}</span>
            <h1 className="page-heading">{product.name[locale]}</h1>
            <p className="page-description">{product.description[locale]}</p>
            <span className="product-badge">{product.badge?.[locale] ?? dictionary.gallery.badgeNew}</span>
            <div className="product-price-row">
              <strong>{formatEGP(product.price, locale)}</strong>
              {product.compareAtPrice && <del>{formatEGP(product.compareAtPrice, locale)}</del>}
            </div>
            <label className="quantity-control">
              <span>{store.quantity}</span>
              <input min="1" onChange={(event) => setQuantity(Math.max(1, Number(event.currentTarget.value) || 1))} type="number" value={quantity} />
            </label>
            <button
              className="button-link"
              onClick={() => {
                addItem(product, quantity);
                setCartOpen(true);
              }}
              type="button"
            >
              {store.addToCart}
            </button>
          </div>
        </section>
        <section aria-labelledby="related-title" className="related-products">
          <div className="section-intro">
            <h2 id="related-title">{store.related}</h2>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <StoreProductCard
                dictionary={dictionary}
                key={item.id}
                locale={locale}
                onAdded={() => setCartOpen(true)}
                preset={preset}
                product={item}
              />
            ))}
          </div>
        </section>
      </main>
      <CartDrawer dictionary={dictionary} locale={locale} onClose={() => setCartOpen(false)} open={cartOpen} />
      <PreviewSwitcher
        activePreset={preset}
        dictionary={dictionary}
        locale={locale}
        pathname={`/preview/${preset.id}/product/${product.id}`}
        presets={presets}
        productDetail
        query={query}
      />
    </div>
  );
}
