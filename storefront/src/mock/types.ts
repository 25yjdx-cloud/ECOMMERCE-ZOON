import type { PresetRouteId } from "@/lib/presets";

export type MockLocale = "ar" | "en";

export type LocalizedText = Record<MockLocale, string>;

export type MockProduct = {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  description: LocalizedText;
  price: number;
  compareAtPrice?: number;
  badge?: LocalizedText;
  preset: PresetRouteId;
  storeSlug?: string;
};

export type PresetMockData = {
  categories: LocalizedText[];
  products: MockProduct[];
};
