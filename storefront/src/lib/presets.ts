import presetRegistry from "../../../config/templates/presets.json";

export const PRESET_IDS = [
  "fashion",
  "furniture",
  "electronics",
  "grocery",
  "local-brand",
] as const;

export type PresetId = (typeof PRESET_IDS)[number];
export type Preset = Omit<(typeof presetRegistry.presets)[number], "id"> & {
  id: PresetId;
};

const allowedIds: ReadonlySet<string> = new Set(PRESET_IDS);
const registryIds = new Set(presetRegistry.presets.map(({ id }) => id));

if (
  presetRegistry.presets.length !== PRESET_IDS.length ||
  registryIds.size !== PRESET_IDS.length ||
  PRESET_IDS.some((id) => !registryIds.has(id))
) {
  throw new Error("Preset registry must contain exactly the five approved IDs.");
}

export function isPresetId(value: string): value is PresetId {
  return allowedIds.has(value);
}

export const presets: readonly Preset[] = presetRegistry.presets.map((preset) => {
  if (!isPresetId(preset.id)) {
    throw new Error(`Unknown preset ID in registry: ${preset.id}`);
  }

  return { ...preset, id: preset.id };
});

export function getPreset(value: string): Preset | undefined {
  if (!isPresetId(value)) {
    return undefined;
  }

  return presets.find((preset) => preset.id === value);
}

export function getFeaturedPresets(): readonly Preset[] {
  return presets.filter(({ featuredOnHome }) => featuredOnHome);
}
