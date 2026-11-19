import type { PresetMockData } from "./types";

const localBrand: PresetMockData = {
  categories: [
    { ar: "العناية بالبشرة", en: "Skincare" },
    { ar: "العطور", en: "Fragrance" },
    { ar: "منتجات يدوية", en: "Handmade" },
    { ar: "المجموعات الجديدة", en: "New collections" },
  ],
  products: [
    { id: "local-brand-1", name: { ar: "عطر زهري", en: "Floral Scent" }, category: { ar: "العطور", en: "Fragrance" }, description: { ar: "مثال تجريبي لمنتج علامة محلية", en: "A demo product for a local brand" }, price: 790, compareAtPrice: 890, badge: { ar: "عرض", en: "Offer" }, preset: "local-brand" },
    { id: "local-brand-2", name: { ar: "صابون يدوي", en: "Handmade Soap" }, category: { ar: "منتجات يدوية", en: "Handmade" }, description: { ar: "قطعة مصنوعة يدويًا للعرض فقط", en: "A handcrafted demo item" }, price: 180, preset: "local-brand" },
    { id: "local-brand-3", name: { ar: "كريم مرطب", en: "Daily Moisturizer" }, category: { ar: "العناية بالبشرة", en: "Skincare" }, description: { ar: "محتوى تجريبي غير مخصص للبيع", en: "Mock content, not for sale" }, price: 390, preset: "local-brand" },
    { id: "local-brand-4", name: { ar: "حقيبة جلدية", en: "Leather Pouch" }, category: { ar: "منتجات يدوية", en: "Handmade" }, description: { ar: "معاينة بطاقة لمنتج محلي", en: "A sample card for a local product" }, price: 1120, preset: "local-brand" },
    { id: "local-brand-5", name: { ar: "زيت عطري", en: "Essential Oil" }, category: { ar: "العطور", en: "Fragrance" }, description: { ar: "معلومات افتراضية للعرض", en: "Fictional details for preview" }, price: 250, preset: "local-brand" },
    { id: "local-brand-6", name: { ar: "مجموعة عناية", en: "Care Set" }, category: { ar: "العناية بالبشرة", en: "Skincare" }, description: { ar: "منتج توضيحي لقالب العلامة", en: "A demo item for the brand preset" }, price: 950, preset: "local-brand" },
  ],
};

export default localBrand;
