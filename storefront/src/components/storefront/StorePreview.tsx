"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import type { QueryValues } from "@/i18n/locale";
import type { Preset } from "@/lib/presets";
import { presets } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { LocaleDocumentAttributes } from "./LocaleDocumentAttributes";
import { PreviewSwitcher } from "./PreviewSwitcher";
import { PreviewTopbar } from "./PreviewTopbar";
import { StoreProductCard } from "./StoreProductCard";
import { templateModules } from "@/templates";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  isStoreBuildPayloadResponse,
  toStorePayloadProduct,
  type StoreBuildPayload,
  type StorePayload,
} from "@/lib/store-payload";
import { StorePixelTracking } from "./StorePixelTracking";
import type { CSSProperties } from "react";

export function StorePreview({
  locale,
  preset,
  dictionary,
  query,
  user,
  allowDemoFallback,
  isLiveStore = false,
  initialPayload,
}: {
  locale: MockLocale;
  preset: Preset;
  dictionary: Dictionary;
  query: QueryValues;
  user: AuthUser | null;
  allowDemoFallback: boolean;
  isLiveStore?: boolean;
  initialPayload?: StoreBuildPayload;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>();
  const [cartOpen, setCartOpen] = useState(false);
  const [remotePayload, setRemotePayload] = useState(initialPayload);
  const [payloadState, setPayloadState] = useState<"loading" | "ready" | "error">(
    initialPayload ? "ready" : "loading",
  );
  const { itemCount } = useCart();
  const data = mockData[preset.id];
  const template = templateModules[preset.id];
  const store = dictionary.store;
  const storeName = store.storeNames[preset.id];
  const requestedStore = Array.isArray(query.store) ? query.store[0] : query.store;
  const storeSlug = requestedStore || preset.id;
  useEffect(() => {
    if (initialPayload?.slug === storeSlug) return;

    let active = true;
    void fetch(`/api/stores/${encodeURIComponent(storeSlug)}/build-payload`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Store payload request failed (${response.status}).`);

        const result: unknown = await response.json();
        if (!isStoreBuildPayloadResponse(result)) {
          throw new Error("Store payload returned an invalid format.");
        }

        return result.data;
      }).then((payload) => {
        if (active) {
          setRemotePayload(payload);
          setPayloadState("ready");
        }
      }).catch(() => {
        if (active) {
          setRemotePayload(undefined);
          setPayloadState("error");
        }
      });

    return () => { active = false; };
  }, [initialPayload, preset.id, storeSlug]);

  const remoteConfig = remotePayload?.config;
  const remoteShipping = remotePayload?.shipping;
  const storePaused = remotePayload?.paused ?? false;

  const productsData = useMemo<StorePayload["products"]>(
    () => remotePayload
      ? remotePayload.products.map((product) =>
          toStorePayloadProduct(product, preset.id, storeSlug, { ar: store.products, en: store.products }),
        )
      : data.products.map((product) => ({ ...product, storeSlug, stockQty: 0 })),
    [data.products, preset.id, remotePayload, store.products, storeSlug],
  );
  const storePayload: StorePayload = {
    slug: storeSlug,
    template: preset.id,
    storeName: remoteConfig?.store_name ?? storeName,
    logoUrl: remoteConfig?.logo_url ?? null,
    primaryColor: remoteConfig?.primary_color ?? template.accent,
    backgroundColor: remoteConfig?.background_color ?? null,
    currency: remoteConfig?.market === "SA" ? "SAR" : "EGP",
    metaPixelId: remoteConfig?.meta_pixel_id ?? null,
    tiktokPixelId: remoteConfig?.tiktok_pixel_id ?? null,
    categories: remotePayload
      ? [...new Map(productsData.map((product) => [product.category.en, product.category])).values()]
      : data.categories,
    products: productsData,
    shipping: remoteShipping ?? {
      requires_approval: preset.id === "furniture",
      rates: [],
    },
  };
  const products = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(locale === "ar" ? "ar-EG" : "en-US");
    return productsData.filter((product) => {
      const matchesCategory = !category || product.category[locale] === category;
      const matchesSearch =
        !term ||
        [product.name[locale], product.category[locale], product.description[locale]]
          .some((value) => value.toLocaleLowerCase(locale === "ar" ? "ar-EG" : "en-US").includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [category, locale, productsData, search]);

  if (!allowDemoFallback && payloadState === "loading") {
    return (
      <main className="store-paused-screen" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        <p role="status">{locale === "ar" ? "جارٍ تحميل المتجر..." : "Loading store..."}</p>
      </main>
    );
  }

  if (!allowDemoFallback && payloadState === "error") {
    return (
      <main className="store-paused-screen" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        <p role="alert">
          {locale === "ar" ? "تعذر تحميل بيانات المتجر حالياً." : "Store data is currently unavailable."}
        </p>
      </main>
    );
  }

  if (storePaused) {
    return (
      <main className="store-paused-screen" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        <LocaleDocumentAttributes locale={locale} />
        <BrandLogo size={72} variant="full" />
        <h1>{locale === "ar"
          ? "هذا المتجر متوقف مؤقتاً لانتهاء الفترة التجريبية — يرجى تجديد الاشتراك لإعادة التفعيل فوراً"
          : "This store is temporarily paused because its trial ended. Renew the subscription to reactivate it."}</h1>
      </main>
    );
  }

  return (
    <div
      className="storefront"
      data-preset={preset.id}
      data-template-module={template.id}
      data-theme-mode={remoteConfig?.mode ?? "light"}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={{
        "--store-accent": storePayload.primaryColor,
        accentColor: storePayload.primaryColor,
        backgroundColor: storePayload.backgroundColor ?? undefined,
      } as CSSProperties}
    >
      <LocaleDocumentAttributes locale={locale} />
      <StorePixelTracking metaPixelId={storePayload.metaPixelId} tiktokPixelId={storePayload.tiktokPixelId} />
      {!isLiveStore && <PreviewTopbar dictionary={dictionary} locale={locale} preset={preset} query={query} user={user} />}
      {preset.id === "nabd" && <div className="store-announcement">{store.nabdAnnouncement}</div>}
      <header className="store-topbar">
        <Link
          className="brand-mark"
          href={isLiveStore
            ? `/s/${encodeURIComponent(storeSlug)}?lang=${locale}`
            : `/preview/${preset.id}?${new URLSearchParams({ lang: locale, ...(requestedStore ? { store: requestedStore } : {}) }).toString()}`}
        >
          {storePayload.logoUrl
            ? <img alt="" className="store-logo" src={storePayload.logoUrl} />
            : <span aria-hidden="true" className="store-logo-fallback">{storePayload.storeName.trim().charAt(0) || "S"}</span>}
          <span>{storePayload.storeName}</span>
        </Link>
        <div className="store-topbar-actions">
          <label className="visually-hidden" htmlFor="store-search">{store.search}</label>
          <input
            className="store-search"
            id="store-search"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={store.search}
            type="search"
            value={search}
          />
          <button className="button-link" onClick={() => setCartOpen(true)} type="button">
            {store.cart} ({itemCount})
          </button>
        </div>
      </header>
      <main>
        <section className={`store-hero store-hero-${preset.id}`}>
          <h1>{remoteConfig?.hero_title ?? store.heroTitles[preset.id]}</h1>
          <p>{remoteConfig?.hero_subtitle || store.heroTexts[preset.id]}</p>
          <a className="button-link" href="#products">{remoteConfig?.hero_cta ?? store.shopNow}</a>
        </section>
        <div
          className="template-module-wrap"
          style={{ backgroundColor: storePayload.backgroundColor ?? template.surface }}
        >
          <template.Details locale={locale} store={storePayload} />
        </div>
        <section className="page-shell store-section" aria-labelledby="products-heading">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{store.products}</span>
              <h2 id="products-heading">{remoteConfig?.store_name ?? storeName}</h2>
            </div>
          </div>
          <div className={`gallery-filters gallery-filters-${preset.id}`} role="group" aria-label={store.allCategories}>
            <button
              aria-pressed={!category}
              className="category-chip"
              onClick={() => setCategory(undefined)}
              type="button"
            >
              {store.allCategories}
            </button>
            {storePayload.categories.map((item) => (
              <button
                aria-pressed={category === item[locale]}
                className="category-chip"
                key={item.en}
                onClick={() => setCategory(item[locale])}
                type="button"
              >
                {item[locale]}
              </button>
            ))}
          </div>
          <div className="product-grid" id="products">
            {products.length > 0 ? products.map((product) => (
              <StoreProductCard
                dictionary={dictionary}
                key={product.id}
                locale={locale}
                onAdded={() => setCartOpen(true)}
                preset={preset}
                product={product}
                currency={storePayload.currency}
                isLiveStore={isLiveStore}
              />
            )) : <p>{store.noResults}</p>}
          </div>
        </section>
      </main>
      <footer className="page-shell site-footer">
        <span>{storePayload.storeName}</span>
      </footer>
      <CartDrawer
        dictionary={dictionary}
        locale={locale}
        onClose={() => setCartOpen(false)}
        open={cartOpen}
        previewMode={!isLiveStore}
        shippingRates={remoteShipping
          ? Object.fromEntries(storePayload.shipping.rates.map((rate) => [rate.governorate, rate.fee]))
          : undefined}
        shippingRequiresApproval={storePayload.shipping.requires_approval}
      />
      {!isLiveStore && (
        <PreviewSwitcher
          activePreset={preset}
          dictionary={dictionary}
          locale={locale}
          pathname={`/preview/${preset.id}`}
          presets={presets}
          query={query}
        />
      )}
    </div>
  );
}
