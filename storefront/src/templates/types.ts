import type { ComponentType } from "react";
import type { PresetId } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";

export type TemplateModuleProps = { locale: MockLocale };

export type TemplateModule = {
  id: PresetId;
  accent: string;
  surface: string;
  Details: ComponentType<TemplateModuleProps>;
};
