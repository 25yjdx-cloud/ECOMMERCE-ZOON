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

type StoreConfigResponse = {
  data: {
    config: {
      store_name?: string;
      primary_color?: string;
      background_color?: string;
      mode?: "light" | "dark";
      hero_title?: string;
      hero_subtitle?: string;
      hero_cta?: string;
    };
  };
};
type StoreProductsResponse = {
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
    stock_qty: number;
  }>;
};

export function StorePreview({
  locale,
  preset,
  dictionary,
  query,
  user,
}: {
  locale: MockLocale;
  preset: Preset;
  dictionary: Dictionary;
  query: QueryValues;
  user: AuthUser | null;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>();
  const [cartOpen, setCartOpen] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<StoreConfigResponse["data"]["config"]>();
  const [remoteProducts, setRemoteProducts] = useState<StoreProductsResponse["data"]>();
  const { itemCount } = useCart();
  const data = mockData[preset.id];
  const template = templateModules[preset.id];
  const store = dictionary.store;
  const storeName = store.storeNames[preset.id];
  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch(`/api/stores/${encodeURIComponent(preset.id)}/config`, { cache: "no-store" }),
      fetch(`/api/stores/${encodeURIComponent(preset.id)}/products`, { cache: "no-store" }),
    ]).then(async ([configResponse, productsResponse]) => {
      if (!configResponse.ok || !productsResponse.ok) return;
      const [configResult, productsResult] = await Promise.all([
        configResponse.json() as Promise<StoreConfigResponse>,
        productsResponse.json() as Promise<StoreProductsResponse>,
      ]);
      if (active) {
        setRemoteConfig(configResult.data.config);
        setRemoteProducts(productsResult.data);
      }
    }).catch(() => {
      if (active) {
        setRemoteConfig(undefined);
        setRemoteProducts(undefined);
      }
    });

    return () => { active = false; };
  }, [preset.id]);
  const productsData = remoteProducts?.length
    ? remoteProducts.map((product) => ({
        id: product.external_id ?? String(product.id),
        name: { ar: product.name_ar, en: product.name_en },
        category: {
          ar: product.category_ar ?? store.products,
          en: product.category_en ?? store.products,
        },
        description: { ar: product.description_ar ?? "", en: product.description_en ?? "" },
        price: Number(product.price),
        ...(product.old_price ? { compareAtPrice: Number(product.old_price) } : {}),
        preset: preset.id,
      }))
    : data.products;
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

  return (
    <div
      className="storefront"
      data-preset={preset.id}
      data-template-module={template.id}
      data-theme-mode={remoteConfig?.mode ?? "light"}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={{
        accentColor: remoteConfig?.primary_color ?? template.accent,
        backgroundColor: remoteConfig?.background_color,
      }}
    >
      <LocaleDocumentAttributes locale={locale} />
      <PreviewTopbar dictionary={dictionary} locale={locale} preset={preset} query={query} user={user} />
      {preset.id === "nabd" && <div className="store-announcement">{store.nabdAnnouncement}</div>}
      <header className="store-topbar">
        <Link className="brand-mark" href={`/preview/${preset.id}?lang=${locale}`}>
          <span aria-hidden="true" className="brand-symbol">C</span>
          <span>{remoteConfig?.store_name ?? storeName}</span>
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
        <div className="template-module-wrap" style={{ backgroundColor: template.surface }}>
          <template.Details locale={locale} />
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
            {data.categories.map((item) => (
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
              />
            )) : <p>{store.noResults}</p>}
          </div>
        </section>
      </main>
      <footer className="page-shell site-footer">
        <span>CommerceForge</span>
      </footer>
      <CartDrawer dictionary={dictionary} locale={locale} onClose={() => setCartOpen(false)} open={cartOpen} />
      <PreviewSwitcher
        activePreset={preset}
        dictionary={dictionary}
        locale={locale}
        pathname={`/preview/${preset.id}`}
        presets={presets}
        query={query}
      />
    </div>
  );
}
