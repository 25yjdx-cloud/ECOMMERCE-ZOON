import { describe, expect, it } from "vitest";
import {
  DEFAULT_MARKET,
  SAAS_PRICES,
  SAAS_YEARLY_MONTHLY_PRICES,
  TURNKEY_PRICES,
  formatMarketPrice,
  getTurnkeyPrice,
} from "./pricing.config";

describe("market pricing configuration", () => {
  it("defaults to Egypt and exposes the configured subscription and turnkey prices", () => {
    expect(DEFAULT_MARKET).toBe("EG");
    expect(SAAS_PRICES.advanced).toEqual({ EG: 599, SA: 69 });
    expect(TURNKEY_PRICES.complete).toEqual({ EG: 7000, SA: 599 });
  });

  it("keeps yearly equivalents within the advertised 17% maximum saving", () => {
    for (const plan of ["growth", "advanced", "professional"] as const) {
      for (const market of ["EG", "SA"] as const) {
        const monthly = SAAS_PRICES[plan][market];
        const annualMonthly = SAAS_YEARLY_MONTHLY_PRICES[plan][market];
        expect(1 - annualMonthly / monthly).toBeLessThanOrEqual(0.17);
      }
    }
  });

  it("formats prices with the selected market currency and resolves package ids safely", () => {
    expect(formatMarketPrice(399, "EG", "en")).toBe("399 ج.م");
    expect(formatMarketPrice(49, "SA", "en")).toBe("49 ر.س");
    expect(getTurnkeyPrice("launch", "SA")).toBe(179);
    expect(getTurnkeyPrice("unsupported", "EG")).toBeUndefined();
  });
});
