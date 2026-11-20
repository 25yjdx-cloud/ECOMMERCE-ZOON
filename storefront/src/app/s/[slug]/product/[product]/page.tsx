import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";
import { getPreset } from "@/lib/presets";
import { toStorePayloadProduct } from "@/lib/store-payload";
import { getStoreBuildPayload } from "@/lib/store-payload-server";
import type { MockLocale } from "@/mock/types";

type StoreProductPageProps = {
  params: Promise<{ slug: string; product: string }>;
  searchParams: Promise<QueryValues>;
};

export const metadata: Metadata = {
  title: "CommerceForge Product",
};

export default async function StoreProductPage({ params, searchParams }: StoreProductPageProps) {
  const [{ slug, product: productSlug }, query, user] = await Promise.all([
    params,
    searchParams,
    getAuthUser(),
  ]);
  const payload = await getStoreBuildPayload(slug);
  if (!payload) notFound();

  const preset = getPreset(payload.templateSlug);
  if (!preset) notFound();

  const sourceProduct = payload.products.find(
    (product) => product.external_id === productSlug || String(product.id) === productSlug,
  );
  if (!sourceProduct) notFound();

  const locale: MockLocale = getLocale(query.lang);
  const dictionary = getDictionary(locale);
  const fallbackCategory = { ar: dictionary.store.products, en: dictionary.store.products };
  const products = payload.products.map((product) =>
    toStorePayloadProduct(product, preset.id, slug, fallbackCategory),
  );
  const product = products.find((item) => item.id === (sourceProduct.external_id ?? String(sourceProduct.id)));
  if (!product) notFound();
  const storeName = payload.config.store_name ?? dictionary.store.storeNames[preset.id];

  return (
    <ProductDetail
      dictionary={dictionary}
      isLiveStore
      locale={locale}
      preset={preset}
      product={product}
      productSlug={productSlug}
      query={{ ...query, store: slug }}
      relatedProducts={products}
      storeName={storeName}
      currency={payload.config.market === "SA" ? "SAR" : "EGP"}
      user={user}
    />
  );
}
