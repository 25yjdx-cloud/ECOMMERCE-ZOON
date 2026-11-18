import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { ShowcasePresetCard } from "./ShowcasePresetCard";

export function PresetCardGrid({
  presets,
  locale,
  dictionary,
}: {
  presets: readonly Preset[];
  locale: MockLocale;
  dictionary: Dictionary;
}) {
  return (
    <div className="preset-grid">
      {presets.map((preset) => (
        <ShowcasePresetCard key={preset.id} preset={preset} locale={locale} dictionary={dictionary} />
      ))}
    </div>
  );
}
