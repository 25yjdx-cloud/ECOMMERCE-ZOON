import type { PresetMockData } from "./types";

const grocery: PresetMockData = {
  categories: [
    { ar: "خضروات وفاكهة", en: "Fruit & vegetables" },
    { ar: "مخبوزات", en: "Bakery" },
    { ar: "منتجات الألبان", en: "Dairy" },
    { ar: "مستلزمات المنزل", en: "Household" },
  ],
  products: [
    { id: "grocery-1", name: { ar: "سلة فاكهة موسمية", en: "Seasonal Fruit Box" }, category: { ar: "خضروات وفاكهة", en: "Fruit & vegetables" }, description: { ar: "مثال توضيحي لسلة طازجة", en: "A sample fresh produce box" }, price: 320, preset: "grocery" },
    { id: "grocery-2", name: { ar: "خبز مخبوز يوميًا", en: "Daily Fresh Bread" }, category: { ar: "مخبوزات", en: "Bakery" }, description: { ar: "مخبوزات طازجة للعرض التجريبي", en: "Fresh bakery for the demo store" }, price: 55, preset: "grocery" },
    { id: "grocery-3", name: { ar: "حليب كامل الدسم", en: "Whole Milk" }, category: { ar: "منتجات الألبان", en: "Dairy" }, description: { ar: "عبوة تجريبية في الكتالوج", en: "A sample pack in the catalog" }, price: 48, preset: "grocery" },
    { id: "grocery-4", name: { ar: "عسل طبيعي", en: "Natural Honey" }, category: { ar: "مستلزمات المنزل", en: "Household" }, description: { ar: "منتج تجريبي ببيانات غير حقيقية", en: "Demo product with fictional details" }, price: 210, preset: "grocery" },
    { id: "grocery-5", name: { ar: "زيت زيتون", en: "Olive Oil" }, category: { ar: "مستلزمات المنزل", en: "Household" }, description: { ar: "عنصر تجريبي لتجربة المتجر", en: "A mock item for the store preview" }, price: 275, preset: "grocery" },
    { id: "grocery-6", name: { ar: "جبنة بيضاء", en: "White Cheese" }, category: { ar: "منتجات الألبان", en: "Dairy" }, description: { ar: "مثال على بطاقة منتج بقالة", en: "A sample grocery product card" }, price: 95, preset: "grocery" },
  ],
};

export default grocery;
