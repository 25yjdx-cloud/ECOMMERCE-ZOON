export const EGYPTIAN_GOVERNORATES = [
  { id: "cairo", name: { ar: "القاهرة", en: "Cairo" }, shippingFee: 50 },
  { id: "giza", name: { ar: "الجيزة", en: "Giza" }, shippingFee: 50 },
  { id: "alexandria", name: { ar: "الإسكندرية", en: "Alexandria" }, shippingFee: 65 },
  { id: "dakahlia", name: { ar: "الدقهلية", en: "Dakahlia" }, shippingFee: 70 },
  { id: "gharbia", name: { ar: "الغربية", en: "Gharbia" }, shippingFee: 70 },
  { id: "sharqia", name: { ar: "الشرقية", en: "Sharqia" }, shippingFee: 70 },
  { id: "monufia", name: { ar: "المنوفية", en: "Monufia" }, shippingFee: 70 },
  { id: "qalyubia", name: { ar: "القليوبية", en: "Qalyubia" }, shippingFee: 60 },
  { id: "beheira", name: { ar: "البحيرة", en: "Beheira" }, shippingFee: 75 },
  { id: "kafr-el-sheikh", name: { ar: "كفر الشيخ", en: "Kafr El Sheikh" }, shippingFee: 75 },
  { id: "damietta", name: { ar: "دمياط", en: "Damietta" }, shippingFee: 75 },
  { id: "port-said", name: { ar: "بورسعيد", en: "Port Said" }, shippingFee: 75 },
  { id: "ismailia", name: { ar: "الإسماعيلية", en: "Ismailia" }, shippingFee: 75 },
  { id: "suez", name: { ar: "السويس", en: "Suez" }, shippingFee: 75 },
  { id: "faiyum", name: { ar: "الفيوم", en: "Faiyum" }, shippingFee: 80 },
  { id: "beni-suef", name: { ar: "بني سويف", en: "Beni Suef" }, shippingFee: 80 },
  { id: "minya", name: { ar: "المنيا", en: "Minya" }, shippingFee: 85 },
  { id: "asyut", name: { ar: "أسيوط", en: "Asyut" }, shippingFee: 85 },
  { id: "sohag", name: { ar: "سوهاج", en: "Sohag" }, shippingFee: 90 },
  { id: "qena", name: { ar: "قنا", en: "Qena" }, shippingFee: 90 },
  { id: "luxor", name: { ar: "الأقصر", en: "Luxor" }, shippingFee: 95 },
  { id: "aswan", name: { ar: "أسوان", en: "Aswan" }, shippingFee: 95 },
  { id: "red-sea", name: { ar: "البحر الأحمر", en: "Red Sea" }, shippingFee: 100 },
  { id: "matrouh", name: { ar: "مطروح", en: "Matrouh" }, shippingFee: 100 },
  { id: "north-sinai", name: { ar: "شمال سيناء", en: "North Sinai" }, shippingFee: 110 },
  { id: "south-sinai", name: { ar: "جنوب سيناء", en: "South Sinai" }, shippingFee: 110 },
  { id: "new-valley", name: { ar: "الوادي الجديد", en: "New Valley" }, shippingFee: 110 },
] as const;

export type GovernorateId = (typeof EGYPTIAN_GOVERNORATES)[number]["id"];

export type CheckoutDetails = {
  name: string;
  phone: string;
  governorate: string;
  address: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutDetails, boolean>>;

const egyptianPhonePattern = /^01[0125][0-9]{8}$/;
const allowedGovernorates: ReadonlySet<string> = new Set(
  EGYPTIAN_GOVERNORATES.map(({ id }) => id),
);

export function getShippingFee(governorate: string): number {
  return EGYPTIAN_GOVERNORATES.find(({ id }) => id === governorate)?.shippingFee ?? 0;
}

export function validateCheckoutDetails(details: CheckoutDetails): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = details.name.trim();
  const address = details.address.trim();

  if (
    !/^[\u0621-\u064Aa-zA-Z\s]{4,}$/.test(name) ||
    /(.)\1{2,}/.test(name)
  ) {
    errors.name = true;
  }

  if (!egyptianPhonePattern.test(details.phone)) {
    errors.phone = true;
  }

  if (!allowedGovernorates.has(details.governorate)) {
    errors.governorate = true;
  }

  if (address.length < 10 || /(.)\1{3,}/.test(address)) {
    errors.address = true;
  }

  return errors;
}
