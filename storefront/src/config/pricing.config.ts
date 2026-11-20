export type MarketId = "EG" | "SA";

export const DEFAULT_MARKET: MarketId = "EG";

export const MARKET_CONFIG = {
  EG: {
    label: { ar: "🇪🇬 مصر", en: "🇪🇬 Egypt" },
    currency: "EGP",
    symbol: "ج.م",
    dialCode: "+20",
    paymentShipping: {
      ar: "الدفع عند الاستلام (COD) • انستا باي (InstaPay) • فودافون كاش • شحن لـ 27 محافظة",
      en: "Cash on delivery • InstaPay • Vodafone Cash • Shipping to all 27 governorates",
    },
  },
  SA: {
    label: { ar: "🇸🇦 السعودية", en: "🇸🇦 Saudi Arabia" },
    currency: "SAR",
    symbol: "ر.س",
    dialCode: "+966",
    paymentShipping: {
      ar: "مدى (Mada) • STC Pay • Apple Pay • الدفع عند الاستلام • شحن لجميع مناطق المملكة",
      en: "Mada • STC Pay • Apple Pay • Cash on delivery • Shipping across Saudi Arabia",
    },
  },
} as const;

export const SAAS_PRICES = {
  starter: { EG: 0, SA: 0 },
  growth: { EG: 399, SA: 49 },
  advanced: { EG: 599, SA: 69 },
  professional: { EG: 999, SA: 119 },
} as const satisfies Record<string, Record<MarketId, number>>;

export const SAAS_YEARLY_MONTHLY_PRICES = {
  starter: { EG: 0, SA: 0 },
  growth: { EG: 332, SA: 41 },
  advanced: { EG: 499, SA: 58 },
  professional: { EG: 832, SA: 99 },
} as const satisfies Record<string, Record<MarketId, number>>;

export const TURNKEY_PRICES = {
  launch: { EG: 2000, SA: 179 },
  growth: { EG: 4500, SA: 379 },
  complete: { EG: 7000, SA: 599 },
} as const satisfies Record<string, Record<MarketId, number>>;

export const TURNKEY_PACKAGE_NAMES_AR = {
  launch: "تجهيز البداية",
  growth: "تجهيز النمو",
  complete: "تجهيز متكامل",
} as const;

export function getTurnkeyPrice(packageId: string, market: MarketId): number | undefined {
  if (packageId === "launch" || packageId === "growth" || packageId === "complete") {
    return TURNKEY_PRICES[packageId][market];
  }

  return undefined;
}

export function getTurnkeyPackageName(packageId: string): string | undefined {
  if (packageId === "launch" || packageId === "growth" || packageId === "complete") {
    return TURNKEY_PACKAGE_NAMES_AR[packageId];
  }

  return undefined;
}

export function formatMarketPrice(amount: number, market: MarketId, locale: "ar" | "en"): string {
  const formattedAmount = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formattedAmount} ${MARKET_CONFIG[market].symbol}`;
}
