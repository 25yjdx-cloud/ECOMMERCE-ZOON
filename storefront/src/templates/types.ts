import type { ComponentType } from "react";
import type { PresetId } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import type { StorePayload } from "@/lib/store-payload";

export type TemplateModuleProps = { locale: MockLocale; store: StorePayload };

export type TemplateModule = {
  id: PresetId;
  accent: string;
  surface: string;
  Details: ComponentType<TemplateModuleProps>;
};
