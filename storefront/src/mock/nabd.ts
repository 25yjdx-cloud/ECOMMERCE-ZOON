import type { PresetMockData } from "./types";

const nabd: PresetMockData = {
  categories: [
    { ar: "جيم", en: "Gym" },
    { ar: "جري", en: "Running" },
    { ar: "ملابس", en: "Apparel" },
    { ar: "ترطيب", en: "Hydration" },
    { ar: "ساعات", en: "Watches" },
    { ar: "شنط", en: "Bags" },
  ],
  products: [
    { id: "nabd-1", name: { ar: "دمبل قابل للتعديل", en: "Adjustable Dumbbell" }, category: { ar: "جيم", en: "Gym" }, description: { ar: "أداة تدريب منزلية متعددة الاستخدام.", en: "A versatile tool for home training." }, price: 1250, badge: { ar: "الأكثر طلبًا", en: "Popular" }, preset: "nabd" },
    { id: "nabd-2", name: { ar: "حذاء جري خفيف", en: "Light Running Shoes" }, category: { ar: "جري", en: "Running" }, description: { ar: "حذاء مريح للحركة اليومية.", en: "Comfortable shoes for everyday movement." }, price: 1890, preset: "nabd" },
    { id: "nabd-3", name: { ar: "قميص تدريب", en: "Training Shirt" }, category: { ar: "ملابس", en: "Apparel" }, description: { ar: "قماش خفيف للتمارين.", en: "Light fabric for training sessions." }, price: 520, compareAtPrice: 650, badge: { ar: "عرض", en: "Offer" }, preset: "nabd" },
    { id: "nabd-4", name: { ar: "زجاجة رياضية", en: "Sports Bottle" }, category: { ar: "ترطيب", en: "Hydration" }, description: { ar: "زجاجة عملية للتمرين والتنقل.", en: "A practical bottle for training and travel." }, price: 240, preset: "nabd" },
    { id: "nabd-5", name: { ar: "ساعة نشاط", en: "Activity Watch" }, category: { ar: "ساعات", en: "Watches" }, description: { ar: "تابع نشاطك اليومي بسهولة.", en: "Keep track of daily activity." }, price: 2150, preset: "nabd" },
    { id: "nabd-6", name: { ar: "حقيبة تدريب", en: "Training Bag" }, category: { ar: "شنط", en: "Bags" }, description: { ar: "مساحة منظمة لمستلزماتك الرياضية.", en: "Organized space for your sports essentials." }, price: 780, preset: "nabd" },
  ],
};

export default nabd;
