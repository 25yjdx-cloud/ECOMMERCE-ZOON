import { describe, expect, it } from "vitest";
import { createMockOrderNumber, validateCheckoutDetails, type CheckoutDetails } from "./validation";

const validDetails: CheckoutDetails = {
  name: "Test Customer",
  phone: "01012345678",
  governorate: "Cairo",
  address: "12 Example Street",
};

describe("mock checkout validation", () => {
  it("accepts valid details and a known governorate", () => {
    expect(validateCheckoutDetails(validDetails)).toEqual({});
  });

  it("rejects missing or malformed delivery details", () => {
    expect(
      validateCheckoutDetails({
        name: " ",
        phone: "123",
        governorate: "Not a governorate",
        address: " ",
      }),
    ).toEqual({
      name: "Enter a name with at least two characters.",
      phone: "Enter a valid Egyptian mobile number.",
      governorate: "Choose an Egyptian governorate.",
      address: "Enter an address with at least five characters.",
    });
  });

  it("generates a visibly mock order number", () => {
    expect(createMockOrderNumber(123456)).toBe("MOCK-2N9C");
  });
});
