import type { PresetMockData } from "./types";

const fashion: PresetMockData = {
  categories: [
    { ar: "فساتين", en: "Dresses" },
    { ar: "ملابس يومية", en: "Everyday" },
    { ar: "حقائب", en: "Bags" },
    { ar: "إكسسوارات", en: "Accessories" },
  ],
  products: [
    { id: "fashion-1", name: { ar: "فستان ليلكي", en: "Lilac Dress" }, category: { ar: "فساتين", en: "Dresses" }, description: { ar: "تصميم أنيق للاستخدام اليومي", en: "An elegant everyday design" }, price: 1890, preset: "fashion" },
    { id: "fashion-2", name: { ar: "قميص كلاسيكي", en: "Classic Shirt" }, category: { ar: "ملابس يومية", en: "Everyday" }, description: { ar: "قصة مريحة وخامة ناعمة", en: "A relaxed cut in a soft fabric" }, price: 790, preset: "fashion" },
    { id: "fashion-3", name: { ar: "حقيبة كتف", en: "Shoulder Bag" }, category: { ar: "حقائب", en: "Bags" }, description: { ar: "تفاصيل بسيطة ولمسة عصرية", en: "Simple details with a modern touch" }, price: 1250, preset: "fashion" },
    { id: "fashion-4", name: { ar: "طقم ذهبي", en: "Golden Set" }, category: { ar: "إكسسوارات", en: "Accessories" }, description: { ar: "قطعة تجريبية لمعاينة المتجر", en: "A demo piece for the store preview" }, price: 540, preset: "fashion" },
    { id: "fashion-5", name: { ar: "جاكيت خفيف", en: "Light Jacket" }, category: { ar: "ملابس يومية", en: "Everyday" }, description: { ar: "طبقة خفيفة بألوان هادئة", en: "A light layer in calm colors" }, price: 1490, preset: "fashion" },
    { id: "fashion-6", name: { ar: "وشاح ناعم", en: "Soft Scarf" }, category: { ar: "إكسسوارات", en: "Accessories" }, description: { ar: "إضافة يومية أنيقة", en: "An elegant everyday accessory" }, price: 390, preset: "fashion" },
  ],
};

export default fashion;
