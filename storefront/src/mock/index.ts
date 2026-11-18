import type { PresetId } from "@/lib/presets";
import type { PresetMockData } from "./types";
import electronics from "./electronics";
import fashion from "./fashion";
import furniture from "./furniture";
import grocery from "./grocery";
import localBrand from "./local-brand";

export const mockData: Record<PresetId, PresetMockData> = {
  fashion,
  furniture,
  electronics,
  grocery,
  "local-brand": localBrand,
};
