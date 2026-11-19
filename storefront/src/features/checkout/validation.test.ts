import { describe, expect, it } from "vitest";
import {
  EGYPTIAN_GOVERNORATES,
  getShippingFee,
  validateCheckoutDetails,
  type CheckoutDetails,
} from "./validation";

const validDetails: CheckoutDetails = {
  name: "Test Customer",
  phone: "01012345678",
  governorate: "cairo",
  address: "15 شارع التحرير الدور الثالث",
};

describe("checkout validation", () => {
  it("accepts valid details and a known governorate", () => {
    expect(validateCheckoutDetails(validDetails)).toEqual({});
  });

  it("rejects malformed or repeated-character customer details", () => {
    expect(
      validateCheckoutDetails({
        name: "aaaa",
        phone: "0101234567a",
        governorate: "unknown",
        address: "aaaaaaaaaa",
      }),
    ).toEqual({
      name: true,
      phone: true,
      governorate: true,
      address: true,
    });
  });

  it("contains all governorates and applies their configured shipping fees", () => {
    expect(EGYPTIAN_GOVERNORATES).toHaveLength(27);
    expect(getShippingFee("cairo")).toBe(50);
    expect(getShippingFee("alexandria")).toBe(65);
    expect(getShippingFee("new-valley")).toBe(110);
    expect(getShippingFee("unknown")).toBe(0);
  });
});
