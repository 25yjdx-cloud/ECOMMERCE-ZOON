import { describe, expect, it } from "vitest";
import { getFeaturedPresets, getPreset, isPresetId, PRESET_IDS, presets } from "./presets";

describe("preset registry", () => {
  it("contains exactly the five approved preset IDs", () => {
    expect(presets.map(({ id }) => id)).toEqual(PRESET_IDS);
  });

  it("accepts known IDs and rejects unknown IDs", () => {
    for (const id of PRESET_IDS) {
      expect(isPresetId(id)).toBe(true);
      expect(getPreset(id)?.id).toBe(id);
    }

    expect(isPresetId("unknown")).toBe(false);
    expect(getPreset("unknown")).toBeUndefined();
  });

  it("keeps the approved template routes and three home features", () => {
    expect(getFeaturedPresets().map(({ id }) => id)).toEqual(["classic", "nabd", "fashion"]);
    expect(getPreset("electronics")?.id).toBe("nabd");
    expect(getPreset("grocery")?.id).toBe("classic");
  });
});
