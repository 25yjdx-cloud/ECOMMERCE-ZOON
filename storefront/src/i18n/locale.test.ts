import { describe, expect, it } from "vitest";
import { createLocaleHref, getLocale } from "./locale";

describe("locale helpers", () => {
  it("preserves the current path and query while changing locale", () => {
    expect(
      createLocaleHref("/preview/fashion/product/fashion-1", { ref: "gallery", lang: "ar" }, "en"),
    ).toBe("/preview/fashion/product/fashion-1?ref=gallery&lang=en");
  });

  it("normalizes unsupported or repeated locale values to Arabic", () => {
    expect(getLocale(["en", "ar"])).toBe("en");
    expect(getLocale("fr")).toBe("ar");
  });
});
