import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getPreset, PRESET_IDS } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale } from "@/mock/types";
import { getAuthUser } from "@/lib/auth";

type ProductPageProps = {
  params: Promise<{ preset: string; slug: string }>;
  searchParams: Promise<QueryValues>;
};

export function generateStaticParams() {
  return PRESET_IDS.flatMap((preset) =>
    mockData[preset].products.map((product) => ({ preset, slug: product.id })),
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { preset: presetId, slug } = await params;
  const preset = getPreset(presetId);
  const product = preset && mockData[preset.id].products.find((item) => item.id === slug);
  return { title: product?.name.en ?? "Product preview" };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const [{ preset: presetId, slug }, query] = await Promise.all([params, searchParams]);
  const preset = getPreset(presetId);
  if (!preset) notFound();

  const product = mockData[preset.id].products.find((item) => item.id === slug);
  const storeSlug = Array.isArray(query.store) ? query.store[0] : query.store;
  if (!product && !storeSlug) notFound();
  const initialProduct = product ?? mockData[preset.id].products[0];

  const locale: MockLocale = getLocale(query.lang);
  const user = await getAuthUser();
  return (
    <ProductDetail
      dictionary={getDictionary(locale)}
      locale={locale}
      preset={preset}
      product={initialProduct}
      productSlug={slug}
      query={query}
      user={user}
    />
  );
}
