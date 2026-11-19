import type { PresetMockData } from "./types";

const classic: PresetMockData = {
  categories: [
    { ar: "إكسسوارات", en: "Accessories" },
    { ar: "هدايا", en: "Gifts" },
    { ar: "ديكور وأدوات", en: "Home & Decor" },
  ],
  products: [
    { id: "classic-1", name: { ar: "مج سيراميك", en: "Ceramic Mug" }, category: { ar: "هدايا", en: "Gifts" }, description: { ar: "مج سيراميك بتصميم هادئ.", en: "A ceramic mug with a calm design." }, price: 150, preset: "classic" },
    { id: "classic-2", name: { ar: "شنطة يومية", en: "Everyday Bag" }, category: { ar: "إكسسوارات", en: "Accessories" }, description: { ar: "شنطة عملية للاستخدام اليومي.", en: "A practical bag for everyday use." }, price: 450, compareAtPrice: 550, badge: { ar: "خصم 18٪", en: "18% off" }, preset: "classic" },
    { id: "classic-3", name: { ar: "سماعة لاسلكية", en: "Wireless Headphones" }, category: { ar: "إكسسوارات", en: "Accessories" }, description: { ar: "سماعة خفيفة بصوت واضح.", en: "Lightweight headphones with clear sound." }, price: 990, preset: "classic" },
    { id: "classic-4", name: { ar: "صندوق هدية", en: "Gift Box" }, category: { ar: "هدايا", en: "Gifts" }, description: { ar: "مجموعة هدايا بتغليف أنيق.", en: "A gift set with thoughtful packaging." }, price: 390, preset: "classic" },
    { id: "classic-5", name: { ar: "ساعة ذكية", en: "Smart Watch" }, category: { ar: "إكسسوارات", en: "Accessories" }, description: { ar: "ساعة يومية بواجهة واضحة.", en: "An everyday watch with a clear display." }, price: 1490, preset: "classic" },
    { id: "classic-6", name: { ar: "نبات زينة", en: "Decorative Plant" }, category: { ar: "ديكور وأدوات", en: "Home & Decor" }, description: { ar: "إضافة خضراء للمساحات الصغيرة.", en: "A green accent for smaller spaces." }, price: 380, preset: "classic" },
  ],
};

export default classic;
