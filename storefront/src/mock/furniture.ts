import type { PresetMockData } from "./types";

const furniture: PresetMockData = {
  categories: [
    { ar: "غرف المعيشة", en: "Living room" },
    { ar: "غرف النوم", en: "Bedroom" },
    { ar: "الإضاءة", en: "Lighting" },
    { ar: "ديكور المنزل", en: "Home decor" },
  ],
  products: [
    { id: "furniture-1", name: { ar: "كرسي خشبي", en: "Oak Accent Chair" }, category: { ar: "غرف المعيشة", en: "Living room" }, description: { ar: "قطعة تجريبية بخطوط بسيطة", en: "A demo piece with clean lines" }, price: 6200, compareAtPrice: 6800, badge: { ar: "عرض", en: "Offer" }, preset: "furniture" },
    { id: "furniture-2", name: { ar: "طاولة جانبية", en: "Side Table" }, category: { ar: "غرف المعيشة", en: "Living room" }, description: { ar: "حجم عملي ولمسة طبيعية", en: "A practical size with a natural finish" }, price: 2450, preset: "furniture" },
    { id: "furniture-3", name: { ar: "مصباح أرضي", en: "Floor Lamp" }, category: { ar: "الإضاءة", en: "Lighting" }, description: { ar: "إضاءة دافئة لركن هادئ", en: "Warm light for a quiet corner" }, price: 3150, preset: "furniture" },
    { id: "furniture-4", name: { ar: "وسادة منسوجة", en: "Woven Cushion" }, category: { ar: "ديكور المنزل", en: "Home decor" }, description: { ar: "تفصيلة مريحة بألوان ترابية", en: "A cozy detail in earthy colors" }, price: 650, preset: "furniture" },
    { id: "furniture-5", name: { ar: "مرآة دائرية", en: "Round Mirror" }, category: { ar: "ديكور المنزل", en: "Home decor" }, description: { ar: "تصميم بسيط للمساحات الصغيرة", en: "A simple design for smaller spaces" }, price: 1890, preset: "furniture" },
    { id: "furniture-6", name: { ar: "طاولة قهوة", en: "Coffee Table" }, category: { ar: "غرف المعيشة", en: "Living room" }, description: { ar: "مساحة عملية بتصميم هادئ", en: "A useful surface with a calm design" }, price: 4800, preset: "furniture" },
  ],
};

export default furniture;
