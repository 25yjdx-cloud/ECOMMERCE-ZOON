import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { StaggerGrid, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ShowcasePresetCard } from "./ShowcasePresetCard";
import type { AuthUser } from "@/lib/auth";

export function PresetCardGrid({
  presets,
  locale,
  dictionary,
  user,
}: {
  presets: readonly Preset[];
  locale: MockLocale;
  dictionary: Dictionary;
  user?: AuthUser | null;
}) {
  return (
    <StaggerGrid className="preset-grid">
      {presets.map((preset) => (
        <StaggerItem key={preset.id}>
          <ShowcasePresetCard preset={preset} locale={locale} dictionary={dictionary} user={user} />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
