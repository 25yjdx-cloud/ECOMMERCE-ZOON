import type { PresetId } from "@/lib/presets";

const iconByPreset: Record<PresetId, string> = {
  classic: "tag",
  nabd: "activity",
  fashion: "hanger",
  furniture: "sofa",
  "local-brand": "tag",
};

export function PresetIcon({ preset, size = 28 }: { preset: PresetId; size?: number }) {
  const icon = iconByPreset[preset];
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" {...common}>
      {icon === "hanger" && <path d="M16 5a3 3 0 0 0-3 3m3-3a2 2 0 1 1 2 2v3L4 20c-1.6 1.2-.8 3 1 3h22c1.8 0 2.6-1.8 1-3L18 10" />}
      {icon === "sofa" && <path d="M6 17v-4a3 3 0 0 1 6 0v2h8v-2a3 3 0 0 1 6 0v4a3 3 0 0 1 2 3v5h-3v-3H7v3H4v-5a3 3 0 0 1 2-3Zm0 0h20M12 15h8" />}
      {icon === "headphones" && <path d="M5 18v-3a11 11 0 0 1 22 0v3m-22 0v6h5v-9H5m22 3v6h-5v-9h5m-17-2a9 9 0 0 1 14 0" />}
      {icon === "basket" && <path d="m5 13 3 14h16l3-14H5Zm3 0 5-8m11 8-5-8m-8 12v5m6-5v5m6-5v5" />}
      {icon === "tag" && <path d="M5 6h12l10 10-11 11L5 16V6Zm5 5h.01" />}
      {icon === "activity" && <path d="M4 17h5l3-10 4 14 3-9h5m-20 4V8m22 9V8" />}
    </svg>
  );
}
