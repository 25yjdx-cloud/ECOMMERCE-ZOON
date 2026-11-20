import type { MockLocale } from "@/mock/types";

export type AdvisorRecommendation = {
  answer: string;
  template: string;
  template_name: string;
  color: string;
  domain_tip: string;
  pricing: string;
  preview_url: string;
  final_preview_url: string;
};

type KnowledgeItem = {
  terms: string[];
  answer: Record<MockLocale, string>;
};

const knowledge: KnowledgeItem[] = [
  { terms: ["ملابس", "أزياء", "fashion", "clothing", "streetwear"], answer: { ar: "لقطاع الملابس والأزياء، اعرض المقاسات والألوان بوضوح وصنّف المنتجات حسب المجموعة والموسم.", en: "For fashion, show sizes and colors clearly and organize products by collection and season." } },
  { terms: ["رياضة", "جيم", "رياضي", "sportswear", "gym", "sports"], answer: { ar: "للنشاط الرياضي، أبرز الأداء والمقاسات ومواصفات الخامة؛ قالب نَبض مناسب لهذا الأسلوب.", en: "For sports retail, highlight performance, sizing, and material details; Nabd suits this style." } },
  { terms: ["أثاث", "ديكور", "furniture", "decor", "homeware"], answer: { ar: "للأثاث والديكور، ركّز على صور المساحات والخامات والأبعاد وخيارات التوصيل.", en: "For furniture and decor, focus on room photography, materials, dimensions, and delivery options." } },
  { terms: ["عطور", "perfume", "fragrance"], answer: { ar: "للعطور، اعرض العائلة العطرية والحجم والمكونات، وقدّم مجموعات الهدايا بوضوح.", en: "For perfumes, present fragrance notes, bottle size, ingredients, and gift sets clearly." } },
  { terms: ["إلكترونيات", "موبايل", "electronic", "phone", "tech"], answer: { ar: "للإلكترونيات، وضّح المواصفات والتوافق والضمان وسياسة الاستبدال قبل الشراء.", en: "For electronics, make specifications, compatibility, warranty, and returns easy to find." } },
  { terms: ["هدايا", "إكسسوارات", "gifts", "accessories"], answer: { ar: "للهدايا والإكسسوارات، استخدم تصنيفات مناسبة للمناسبة وخيارات تغليف ورسالة إهداء.", en: "For gifts and accessories, add occasion-based collections, gift wrapping, and gift notes." } },
  { terms: ["قهوة", "كافيه", "مقهى", "cafe", "coffee"], answer: { ar: "للقهوة والكافيهات، اعرض التحميص والمنشأ والأحجام وموعد التوصيل المتوقع.", en: "For coffee and cafes, show roast, origin, sizes, and expected delivery time." } },
  { terms: ["رقمي", "كتاب إلكتروني", "digital", "ebook", "download"], answer: { ar: "للمنتجات الرقمية، وضّح صيغة الملف وطريقة الوصول وسياسة الدعم قبل إتمام الطلب.", en: "For digital goods, explain file formats, access delivery, and support terms before checkout." } },
  { terms: ["لوكال", "محلي", "صناعة يدوية", "local brand", "handmade"], answer: { ar: "للعلامات المحلية، قدّم قصة الصانع والخامات ومصدر المنتج مع صور حقيقية.", en: "For local brands, tell the maker story and show materials, product origin, and real photos." } },
  { terms: ["اشتراك", "أسعار", "سعر", "pricing", "subscription", "price"], answer: { ar: "السعر ثابت حسب السوق: مصر 399 و599 و999 ج.م شهرياً للخطط المدفوعة، والسعودية 49 و69 و119 ر.س. البداية تجربة 14 يوماً.", en: "Prices are fixed by market: Egypt EGP 399, 599, and 999 monthly; Saudi Arabia SAR 49, 69, and 119. Starter includes a 14-day trial." } },
  { terms: ["تجربة", "مجاني", "14 يوم", "trial", "free"], answer: { ar: "تبدأ الخطة الأساسية بتجربة مجانية لمدة 14 يوماً. بعد انتهائها يتوقف المتجر مؤقتاً وتظل بياناته محفوظة حتى الترقية.", en: "The starter plan includes a 14-day free trial. After it ends, the store pauses while its data remains saved until upgrade." } },
  { terms: ["70%", "30%", "إطلاق", "5 دقائق", "launch", "48 ساعة"], answer: { ar: "تنجز 70% فوراً باختيار القالب وإضافة الهوية والمنتجات. ثم يراجع المطور الإعدادات والنطاق خلال 24–48 ساعة لإتمام 30%.", en: "Complete 70% immediately by choosing a template and adding identity and products. The developer reviews setup and domain within 24–48 hours to finish the remaining 30%." } },
  { terms: ["واتساب", "whatsapp", "تواصل", "contact"], answer: { ar: "يمكنك إرسال طلب التنفيذ من النموذج أو التواصل مع المطور مباشرة عبر واتساب على +201145335168.", en: "Submit a turnkey request in the form or contact the developer directly on WhatsApp at +201145335168." } },
  { terms: ["الدفع عند الاستلام", "cod", "استلام"], answer: { ar: "يمكن إعداد الدفع عند الاستلام، مع تحديد المحافظات ورسوم الشحن وسياسة تأكيد الطلب.", en: "Cash on delivery can be configured with supported regions, shipping fees, and order-confirmation rules." } },
  { terms: ["انستا باي", "instapay", "فودافون كاش", "vodafone cash"], answer: { ar: "في مصر يمكن عرض تعليمات InstaPay أو فودافون كاش وطلب إثبات التحويل، بعد تجهيز حساب التاجر.", en: "In Egypt, the store can show InstaPay or Vodafone Cash instructions and collect transfer proof once the merchant account is ready." } },
  { terms: ["مدى", "mada", "stc pay", "ابل باي", "apple pay"], answer: { ar: "للسعودية يمكن تهيئة مدى وSTC Pay وApple Pay عبر مزود دفع مناسب وحساب تاجر موثق.", en: "In Saudi Arabia, Mada, STC Pay, and Apple Pay can be configured through a compatible provider and verified merchant account." } },
  { terms: ["شحن", "بوليصة", "shipping", "waybill"], answer: { ar: "تجهيز الشحن يعتمد على شركة الخدمة ومناطق التغطية؛ يمكن إعداد بيانات البوليصة ورسوم المناطق قبل الإطلاق.", en: "Shipping setup depends on the carrier and coverage areas; waybill details and regional fees can be configured before launch." } },
  { terms: ["باركود", "barcode", "code128"], answer: { ar: "تدعم خطة المتقدمة وما فوق إنشاء باركود CODE128 للمنتجات عند تفعيل أدوات المخزون.", en: "Advanced plans and above include CODE128 product barcodes when inventory tools are enabled." } },
  { terms: ["بيكسل", "meta", "تيك توك", "tiktok", "snapchat"], answer: { ar: "ربط Meta وTikTok وSnapchat Pixel متاح ضمن الخطط المناسبة بعد إدخال المعرّفات من لوحة الإدارة.", en: "Meta, TikTok, and Snapchat pixel connections are available on eligible plans after adding the IDs in the dashboard." } },
  { terms: ["دومين", "نطاق", "domain"], answer: { ar: "تبدأ الخطة المجانية برابط فرعي، ويمكن ربط نطاق خاص في الخطط المدفوعة بعد ضبط DNS والاستضافة.", en: "The free trial uses a subdomain. Paid plans can connect a custom domain after DNS and hosting are configured." } },
  { terms: ["سلة متروكة", "عربة متروكة", "abandoned cart"], answer: { ar: "استعادة السلات المتروكة متاحة في الخطط المؤهلة، مع مراعاة إعداد موافقات التواصل وسياسة الخصوصية.", en: "Abandoned-cart recovery is available on eligible plans, subject to communication consent and privacy settings." } },
  { terms: ["مخزون", "مقاس", "لون", "inventory", "size", "color"], answer: { ar: "يمكن تنظيم المخزون حسب اللون والمقاس ومتابعة الكميات والتنبيه عند اقتراب النفاد.", en: "Inventory can be organized by color and size, with quantity tracking and low-stock alerts." } },
  { terms: ["ملكية", "بياناتي", "الكود", "ownership", "my data", "source code"], answer: { ar: "تبقى بيانات المنتجات والعملاء والطلبات ملكاً لصاحب المتجر. تفاصيل تسليم نسخة الكود تتحدد ضمن نطاق الباقة والاتفاق.", en: "Product, customer, and order data remain yours. Source-code delivery is defined by the selected package and agreement." } },
  { terms: ["فاتورة", "ضريبة", "invoice", "tax"], answer: { ar: "يجب ضبط بيانات الفواتير والضرائب وفق كيانك ومتطلبات بلدك، ولا تُعد معاينة القالب بديلاً عن مراجعة محاسبية.", en: "Configure invoices and taxes for your legal entity and local requirements; a template preview is not accounting advice." } },
  { terms: ["كوبون", "خصم", "coupon", "discount"], answer: { ar: "تتيح خطة النمو وما فوق إعداد كوبونات الخصم، مع تحديد مدة الصلاحية والحد الأدنى وشروط الاستخدام.", en: "Growth and higher plans support discount coupons with expiry dates, minimums, and usage rules." } },
  { terms: ["تحليلات", "أرباح", "analytics", "profit"], answer: { ar: "توفر الخطط المتقدمة تقارير أوسع، وتحتاج دقة النتائج إلى إدخال تكاليف المنتجات والشحن والرسوم بشكل صحيح.", en: "Advanced plans provide broader reporting; accurate results require correct product, shipping, and fee costs." } },
  { terms: ["تسجيل", "حساب", "register", "account"], answer: { ar: "أنشئ حساباً بالبريد الإلكتروني أو Google، وأضف رقم واتساب ومفتاح الدولة لاستكمال بيانات التواصل.", en: "Register with email or Google, then provide your WhatsApp number and country code for contact details." } },
  { terms: ["قالب", "تصميم", "template", "design"], answer: { ar: "لدينا خمسة قوالب بداية، ويمكنك معاينة القالب الأساسي والنتيجة النهائية قبل اختيار الأنسب لنشاطك.", en: "There are five starter templates; preview both the starter and final versions before choosing one for your business." } },
  { terms: ["صور", "منتجات", "products", "images"], answer: { ar: "استخدم صوراً واضحة ومملوكة لك، واكتب وصفاً دقيقاً وسياسة استبدال سهلة العثور عليها.", en: "Use clear images you own, accurate descriptions, and an easy-to-find returns policy." } },
  { terms: ["حماية", "أمان", "security", "secure"], answer: { ar: "تُحمى لوحة الإدارة بتسجيل دخول وصلاحيات منفصلة؛ استخدم كلمة مرور قوية ولا تشارك بيانات الدخول.", en: "The management dashboard uses authenticated access and role boundaries; use a strong password and never share credentials." } },
  { terms: ["استضافة", "hosting", "سيرفر"], answer: { ar: "يمكن تشغيل المتجر على استضافة مُدارة أو إعداد استضافة خاصة حسب الباقة والموارد المطلوبة.", en: "The store can run on managed hosting or be configured on client hosting, depending on package and resource needs." } },
  { terms: ["دعم", "مساعدة", "support", "help"], answer: { ar: "تختلف المتابعة حسب الباقة؛ باقة الاحترافية تتضمن أولوية الدعم ومراجعة شهرية من المطور.", en: "Follow-up varies by plan; Professional includes priority support and a monthly developer review." } },
  { terms: ["توصيل", "محافظة", "منطقة", "delivery", "region"], answer: { ar: "حدد المحافظات أو المناطق التي تخدمها، ورسوم كل منطقة والمدة المتوقعة قبل نشر المتجر.", en: "Set the governorates or regions you serve, shipping fees, and expected delivery times before publishing." } },
];

export const AI_ADVISOR_INTENT_COUNT = knowledge.length * 2;

function recommendTemplate(question: string): string {
  const text = question.toLocaleLowerCase();
  if (["رياض", "جيم", "رياضي", "sports", "gym"].some((term) => text.includes(term))) return "nabd";
  if (["ملابس", "أزياء", "fashion", "clothing"].some((term) => text.includes(term))) return "fashion";
  if (["أثاث", "ديكور", "furniture", "decor"].some((term) => text.includes(term))) return "furniture";
  if (["لوكال", "محلي", "handmade", "local brand"].some((term) => text.includes(term))) return "local-brand";
  return "classic";
}

const templateDetails: Record<string, Record<MockLocale, { name: string; color: string }>> = {
  classic: { ar: { name: "كلاسيكي", color: "كريمي دافئ مع لمسات عنبرية" }, en: { name: "Classic", color: "Warm cream with amber accents" } },
  nabd: { ar: { name: "نَبض", color: "فحمي مع أخضر ليموني" }, en: { name: "Nabd", color: "Charcoal with lime accents" } },
  fashion: { ar: { name: "فريدة", color: "فحمي مع ذهبي شامبانيا" }, en: { name: "Farida", color: "Charcoal with champagne gold" } },
  furniture: { ar: { name: "دارك", color: "جوزي دافئ مع رملي هادئ" }, en: { name: "Darak", color: "Warm walnut with soft sand" } },
  "local-brand": { ar: { name: "هوية", color: "أسود حضري مع برتقالي محروق" }, en: { name: "Hawia", color: "Urban ink with burnt orange" } },
};

export function getLocalAdvisorAnswer(question: string, locale: MockLocale): AdvisorRecommendation | undefined {
  const normalized = question.toLocaleLowerCase();
  const item = knowledge.find(({ terms }) => terms.some((term) => normalized.includes(term.toLocaleLowerCase())));
  if (!item) return undefined;

  const template = recommendTemplate(question);
  const details = templateDetails[template][locale];

  return {
    answer: `${item.answer[locale]} ${locale === "ar" ? `أنسب قالب مبدئي: ${details.name}.` : `Suggested starter template: ${details.name}.`}`,
    template,
    template_name: details.name,
    color: details.color,
    domain_tip: locale === "ar"
      ? "ابدأ برابط فرعي، واربط نطاقك الخاص عند الاستعداد للنشر."
      : "Start with a subdomain, then connect a custom domain when ready to publish.",
    pricing: locale === "ar"
      ? "جرّب المنصة 14 يوماً؛ الأسعار تظهر حسب السوق المختار."
      : "Try the platform for 14 days; pricing follows the selected market.",
    preview_url: `/preview/${template}`,
    final_preview_url: `/final-preview/${template}`,
  };
}
