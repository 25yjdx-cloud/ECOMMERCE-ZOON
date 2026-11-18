import type { PresetId } from "@/lib/presets";

export type MockLocale = "ar" | "en";

export type LocalizedText = Record<MockLocale, string>;

export type MockProduct = {
  id: string;
  name: LocalizedText;
  category: LocalizedText;
  description: LocalizedText;
  price: number;
  preset: PresetId;
};

export type PresetMockData = {
  categories: LocalizedText[];
  products: MockProduct[];
};
