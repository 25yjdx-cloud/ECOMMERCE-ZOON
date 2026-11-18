export const EGYPTIAN_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Damietta",
  "Dakahlia",
  "Sharqia",
  "Gharbia",
  "Monufia",
  "Kafr El Sheikh",
  "Beheira",
  "Ismailia",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
] as const;

export type CheckoutDetails = {
  name: string;
  phone: string;
  governorate: string;
  address: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutDetails, string>>;

const egyptianPhonePattern = /^(?:\+20|0020|0)?1[0125]\d{8}$/;
const allowedGovernorates: ReadonlySet<string> = new Set(EGYPTIAN_GOVERNORATES);

export function validateCheckoutDetails(details: CheckoutDetails): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (details.name.trim().length < 2) {
    errors.name = "Enter a name with at least two characters.";
  }

  const normalizedPhone = details.phone.replace(/[\s()-]/g, "");
  if (!egyptianPhonePattern.test(normalizedPhone)) {
    errors.phone = "Enter a valid Egyptian mobile number.";
  }

  if (!allowedGovernorates.has(details.governorate)) {
    errors.governorate = "Choose an Egyptian governorate.";
  }

  if (details.address.trim().length < 5) {
    errors.address = "Enter an address with at least five characters.";
  }

  return errors;
}

export function createMockOrderNumber(now = Date.now()): string {
  return `MOCK-${now.toString(36).toUpperCase()}`;
}
