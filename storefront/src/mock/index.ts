import type { PresetId } from "@/lib/presets";
import type { PresetMockData } from "./types";
import classic from "./classic";
import fashion from "./fashion";
import furniture from "./furniture";
import localBrand from "./local-brand";
import nabd from "./nabd";

export const mockData: Record<PresetId, PresetMockData> = {
  classic,
  nabd,
  fashion,
  furniture,
  "local-brand": localBrand,
};
