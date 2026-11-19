import type { MockLocale } from "@/mock/types";

export function formatEGP(amount: number, locale: MockLocale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}
