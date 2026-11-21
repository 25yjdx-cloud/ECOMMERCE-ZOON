import type { LocalizedText, MockProduct } from "@/mock/types";
import { isPresetId, type PresetId } from "./presets";

export type StorePayloadProduct = MockProduct & { stockQty: number };

export type StoreBuildPayload = {
  slug: string;
  templateSlug: PresetId;
  paused: boolean;
  trial_ends_at: string | null;
  config: {
    store_name?: string;
    store_name_en?: string;
    logo_url?: string | null;
    primary_color?: string;
    background_color?: string | null;
    mode?: "light" | "dark";
    hero_title?: string;
    hero_title_en?: string;
    hero_subtitle?: string;
    hero_subtitle_en?: string;
    hero_cta?: string;
    hero_cta_en?: string;
    store_niche?: "clothing" | "electronics" | "beauty" | "food" | "general";
    description_ar?: string;
    description_en?: string;
    trust_badges?: Array<{ ar: string; en: string }>;
    returns_policy?: { ar: string; en: string };
    market?: "EG" | "SA";
    meta_pixel_id?: string | null;
    tiktok_pixel_id?: string | null;
  };
  shipping: {
    requires_approval: boolean;
    rates: Array<{ governorate: string; fee: number }>;
  };
  products: Array<{
    id: number;
    external_id: string | null;
    name_ar: string;
    name_en: string;
    description_ar: string | null;
    description_en: string | null;
    category_ar: string | null;
    category_en: string | null;
    price: number | string;
    old_price: number | string | null;
    stock_qty: number;
  }>;
};

export type StorePayload = {
  slug: string;
  template: PresetId;
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  backgroundColor: string | null;
  currency: "EGP" | "SAR";
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  categories: LocalizedText[];
  products: StorePayloadProduct[];
  shipping: {
    requires_approval: boolean;
    rates: Array<{ governorate: string; fee: number }>;
  };
};

export function toStorePayloadProduct(
  product: StoreBuildPayload["products"][number],
  preset: PresetId,
  storeSlug: string,
  fallbackCategory: LocalizedText,
): StorePayloadProduct {
  return {
    id: product.external_id ?? String(product.id),
    name: { ar: product.name_ar, en: product.name_en },
    category: {
      ar: product.category_ar ?? fallbackCategory.ar,
      en: product.category_en ?? fallbackCategory.en,
    },
    description: { ar: product.description_ar ?? "", en: product.description_en ?? "" },
    price: Number(product.price),
    ...(product.old_price ? { compareAtPrice: Number(product.old_price) } : {}),
    preset,
    storeSlug,
    stockQty: product.stock_qty,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isStoreBuildPayload(value: unknown): value is StoreBuildPayload {
  if (
    !isRecord(value)
    || typeof value.slug !== "string"
    || typeof value.templateSlug !== "string"
    || !isPresetId(value.templateSlug)
    || typeof value.paused !== "boolean"
    || !(value.trial_ends_at === null || typeof value.trial_ends_at === "string")
    || !isRecord(value.config)
    || !isRecord(value.shipping)
    || typeof value.shipping.requires_approval !== "boolean"
    || !Array.isArray(value.shipping.rates)
    || !Array.isArray(value.products)
  ) {
    return false;
  }

  return value.shipping.rates.every((rate) =>
    isRecord(rate)
    && typeof rate.governorate === "string"
    && typeof rate.fee === "number",
  ) && value.products.every((product) =>
    isRecord(product)
    && typeof product.id === "number"
    && (product.external_id === null || typeof product.external_id === "string")
    && typeof product.name_ar === "string"
    && typeof product.name_en === "string"
    && (product.description_ar === null || typeof product.description_ar === "string")
    && (product.description_en === null || typeof product.description_en === "string")
    && (product.category_ar === null || typeof product.category_ar === "string")
    && (product.category_en === null || typeof product.category_en === "string")
    && (typeof product.price === "number" || typeof product.price === "string")
    && (product.old_price === null || typeof product.old_price === "number" || typeof product.old_price === "string")
    && typeof product.stock_qty === "number",
  );
}

export function isStoreBuildPayloadResponse(
  value: unknown,
): value is { data: StoreBuildPayload } {
  return isRecord(value) && isStoreBuildPayload(value.data);
}
