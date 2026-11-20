"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
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
import { WorldQuickSwitcher } from "@/components/platform/WorldQuickSwitcher";

export function ProductDetail({
  product,
  productSlug,
  preset,
  locale,
  dictionary,
  query,
  user,
  isLiveStore = false,
  relatedProducts,
  storeName: storeNameOverride,
  currency = "EGP",
}: {
  product: MockProduct;
  productSlug: string;
  preset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
  query: QueryValues;
  user: AuthUser | null;
  isLiveStore?: boolean;
  relatedProducts?: MockProduct[];
  storeName?: string;
  currency?: "EGP" | "SAR";
}) {
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [displayProduct, setDisplayProduct] = useState(product);
  const { addItem, itemCount } = useCart();
  const related = (relatedProducts ?? mockData[preset.id].products)
    .filter(({ id }) => id !== product.id)
    .slice(0, 3);
  const storeName = storeNameOverride ?? dictionary.store.storeNames[preset.id];
  const store = dictionary.store;
  const template = templateModules[preset.id];
  const requestedStore = Array.isArray(query.store) ? query.store[0] : query.store;
  const formattedPrice = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    if (isLiveStore) return;

    const storeSlug = String(requestedStore ?? "");
    if (!storeSlug) return;
    let active = true;

    async function loadProduct() {
      try {
        const response = await fetch(`/api/stores/${encodeURIComponent(storeSlug)}/products`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as {
          data: Array<{
            id: number;
            external_id: string | null;
            name_ar: string;
            name_en: string;
            description_ar: string | null;
            description_en: string | null;
            category_ar: string | null;
            category_en: string | null;
            price: number;
            old_price: number | null;
          }>;
        };
        const remote = result.data.find((item) => item.external_id === productSlug || String(item.id) === productSlug);
        if (active && remote) {
          setDisplayProduct({
            id: remote.external_id ?? String(remote.id),
            name: { ar: remote.name_ar, en: remote.name_en },
            category: { ar: remote.category_ar ?? store.products, en: remote.category_en ?? store.products },
            description: { ar: remote.description_ar ?? "", en: remote.description_en ?? "" },
            price: Number(remote.price),
            ...(remote.old_price ? { compareAtPrice: Number(remote.old_price) } : {}),
            preset: preset.id,
            storeSlug,
          });
        }
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
      }
    }

    void loadProduct();
    return () => { active = false; };
  }, [isLiveStore, productSlug, preset.id, requestedStore, store.products]);

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
      {!isLiveStore && (
        <PreviewTopbar
          dictionary={dictionary}
          locale={locale}
          pathname={`/preview/${preset.id}/product/${product.id}`}
          preset={preset}
          query={query}
          user={user}
        />
      )}
      {preset.id === "nabd" && <div className="store-announcement">{store.nabdAnnouncement}</div>}
      <header className="store-topbar">
        <Link
          className="brand-mark"
          href={createLocaleHref(
            isLiveStore && requestedStore ? `/s/${encodeURIComponent(requestedStore)}` : `/preview/${preset.id}`,
            query,
            locale,
          )}
        >
          <span aria-hidden="true" className="brand-symbol">C</span>
          <span>{storeName}</span>
        </Link>
        <div className="store-topbar-actions">
          {isLiveStore && requestedStore && (
            <WorldQuickSwitcher locale={locale} storeSlug={requestedStore} user={user} />
          )}
          <Link
            className="button-link"
            href={createLocaleHref(
              isLiveStore && requestedStore ? `/s/${encodeURIComponent(requestedStore)}` : `/preview/${preset.id}`,
              query,
              locale,
            )}
          >
            {dictionary.navigation.storeHome}
          </Link>
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
            <span className="eyebrow">{displayProduct.category[locale]}</span>
            <h1 className="page-heading">{displayProduct.name[locale]}</h1>
            <p className="page-description">{displayProduct.description[locale]}</p>
              <span className="product-badge">{displayProduct.badge?.[locale] ?? dictionary.gallery.badgeNew}</span>
            <div className="product-price-row">
                <strong>{formattedPrice.format(displayProduct.price)}</strong>
                {displayProduct.compareAtPrice && <del>{formattedPrice.format(displayProduct.compareAtPrice)}</del>}
            </div>
            <label className="quantity-control">
              <span>{store.quantity}</span>
              <input min="1" onChange={(event) => setQuantity(Math.max(1, Number(event.currentTarget.value) || 1))} type="number" value={quantity} />
            </label>
            <button
              className="button-link"
              onClick={() => {
                addItem(requestedStore ? { ...displayProduct, storeSlug: requestedStore } : displayProduct, quantity);
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
                currency={currency}
                storeSlug={requestedStore}
                isLiveStore={isLiveStore}
              />
            ))}
          </div>
        </section>
      </main>
      {isLiveStore && requestedStore && (
        <footer className="page-shell site-footer">
          <span>{storeName}</span>
          <nav aria-label={locale === "ar" ? "روابط المتجر" : "Store links"}>
            <Link href={`/s/${encodeURIComponent(requestedStore)}/track?lang=${locale}`}>
              {locale === "ar" ? "تتبع طلبك" : "Track your order"}
            </Link>
            <Link href={`/s/${encodeURIComponent(requestedStore)}/returns?lang=${locale}`}>
              {locale === "ar" ? "الاستبدال والاسترجاع" : "Returns & exchange"}
            </Link>
          </nav>
        </footer>
      )}
      <CartDrawer dictionary={dictionary} locale={locale} onClose={() => setCartOpen(false)} open={cartOpen} />
      {!isLiveStore && (
        <PreviewSwitcher
          activePreset={preset}
          dictionary={dictionary}
          locale={locale}
          pathname={`/preview/${preset.id}/product/${product.id}`}
          presets={presets}
          productDetail
          query={query}
        />
      )}
    </div>
  );
}
