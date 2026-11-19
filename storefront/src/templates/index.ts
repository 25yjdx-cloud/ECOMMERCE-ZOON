import type { PresetId } from "@/lib/presets";
import type { TemplateModule } from "./types";
import { classicTemplate } from "./classic";
import { nabdTemplate } from "./nabd";
import { fashionTemplate } from "./fashion";
import { furnitureTemplate } from "./furniture";
import { localBrandTemplate } from "./local-brand";

export const templateModules: Record<PresetId, TemplateModule> = {
  classic: classicTemplate,
  nabd: nabdTemplate,
  fashion: fashionTemplate,
  furniture: furnitureTemplate,
  "local-brand": localBrandTemplate,
};
