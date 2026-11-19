import type { PresetMockData } from "./types";

const electronics: PresetMockData = {
  categories: [
    { ar: "الهواتف", en: "Phones" },
    { ar: "الصوتيات", en: "Audio" },
    { ar: "المنزل الذكي", en: "Smart home" },
    { ar: "الإكسسوارات", en: "Accessories" },
  ],
  products: [
    { id: "electronics-1", name: { ar: "سماعات لاسلكية", en: "Wireless Headphones" }, category: { ar: "الصوتيات", en: "Audio" }, description: { ar: "عنصر توضيحي لواجهة المنتجات", en: "A sample item for the product grid" }, price: 2290, compareAtPrice: 2490, badge: { ar: "عرض", en: "Offer" }, preset: "electronics" },
    { id: "electronics-2", name: { ar: "ساعة ذكية", en: "Smart Watch" }, category: { ar: "الإكسسوارات", en: "Accessories" }, description: { ar: "تصميم بسيط لعرض المواصفات", en: "A clean layout for product details" }, price: 3450, preset: "electronics" },
    { id: "electronics-3", name: { ar: "مكبر صوت", en: "Compact Speaker" }, category: { ar: "الصوتيات", en: "Audio" }, description: { ar: "صوت واضح بحجم صغير", en: "Clear sound in a compact size" }, price: 1750, preset: "electronics" },
    { id: "electronics-4", name: { ar: "مصباح ذكي", en: "Smart Lamp" }, category: { ar: "المنزل الذكي", en: "Smart home" }, description: { ar: "إضاءة منزلية سهلة التحكم", en: "Easy-to-control home lighting" }, price: 990, preset: "electronics" },
    { id: "electronics-5", name: { ar: "شاحن سريع", en: "Fast Charger" }, category: { ar: "الإكسسوارات", en: "Accessories" }, description: { ar: "قطعة تجريبية ضمن المعاينة", en: "A demo item in this preview" }, price: 620, preset: "electronics" },
    { id: "electronics-6", name: { ar: "لوحة مفاتيح", en: "Wireless Keyboard" }, category: { ar: "الإكسسوارات", en: "Accessories" }, description: { ar: "مساحة عرض لمواصفات المنتج", en: "A sample layout for product specs" }, price: 1390, preset: "electronics" },
  ],
};

export default electronics;
