import { describe, expect, it } from "vitest";
import { AI_ADVISOR_INTENT_COUNT, getLocalAdvisorAnswer } from "./ai-advisor-kb";

describe("local AI advisor knowledge base", () => {
  it("contains at least 60 localized intent answers", () => {
    expect(AI_ADVISOR_INTENT_COUNT).toBeGreaterThanOrEqual(60);
  });

  it("matches Arabic and English business niches and returns both preview routes", () => {
    const arabicRecommendation = getLocalAdvisorAnswer("أبحث عن متجر ملابس شبابي", "ar");
    const englishRecommendation = getLocalAdvisorAnswer("I sell sportswear", "en");

    expect(arabicRecommendation?.template).toBe("fashion");
    expect(arabicRecommendation?.final_preview_url).toBe("/final-preview/fashion");
    expect(englishRecommendation?.template).toBe("nabd");
    expect(englishRecommendation?.preview_url).toBe("/preview/nabd");
  });

  it("leaves unknown questions for the backend fallback and unanswered-query logging", () => {
    expect(getLocalAdvisorAnswer("a completely unknown inquiry", "en")).toBeUndefined();
  });
});
