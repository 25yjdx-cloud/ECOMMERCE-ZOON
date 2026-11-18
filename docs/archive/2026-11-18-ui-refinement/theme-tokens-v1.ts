import type { CSSProperties } from "react";
import type { PresetId } from "@/lib/presets";

export type ThemeTokens = {
  primary: string;
  onPrimary: string;
  accent: string;
  background: string;
  surface: string;
  muted: string;
  text: string;
  textMuted: string;
  line: string;
  radius: string;
  font: string;
};

const themeTokens: Record<PresetId, ThemeTokens> = {
  fashion: {
    primary: "#552d43",
    onPrimary: "#fffafc",
    accent: "#d5a263",
    background: "#fbf6f2",
    surface: "#fffdfb",
    muted: "#f0e5e2",
    text: "#30232c",
    textMuted: "#7c6b75",
    line: "#eadfe3",
    radius: "1.25rem",
    font: '"Tajawal", "Cairo", "Noto Sans Arabic", Arial, sans-serif',
  },
  furniture: {
    primary: "#365044",
    onPrimary: "#f8f6ef",
    accent: "#bd8a52",
    background: "#f4f1e9",
    surface: "#fffefa",
    muted: "#e9e2d4",
    text: "#26352e",
    textMuted: "#6d776f",
    line: "#ded9cb",
    radius: "0.8rem",
    font: '"Cairo", "Tajawal", "Noto Sans Arabic", Arial, sans-serif',
  },
  electronics: {
    primary: "#174c77",
    onPrimary: "#f6fbff",
    accent: "#f1a54d",
    background: "#f2f7fb",
    surface: "#ffffff",
    muted: "#dfeaf2",
    text: "#1d3140",
    textMuted: "#627789",
    line: "#d8e3eb",
    radius: "0.75rem",
    font: '"Noto Sans Arabic", "Cairo", Arial, sans-serif',
  },
  grocery: {
    primary: "#42623f",
    onPrimary: "#fafff7",
    accent: "#e59a50",
    background: "#f4f7ed",
    surface: "#ffffff",
    muted: "#e6eddc",
    text: "#2b3b29",
    textMuted: "#6c7a64",
    line: "#dce5d2",
    radius: "1rem",
    font: '"Tajawal", "Noto Sans Arabic", Arial, sans-serif',
  },
  "local-brand": {
    primary: "#493c72",
    onPrimary: "#fbf9ff",
    accent: "#c99272",
    background: "#f6f3f8",
    surface: "#fffefe",
    muted: "#ebe5f0",
    text: "#302842",
    textMuted: "#766d83",
    line: "#e3dce9",
    radius: "1.15rem",
    font: '"Cairo", "Tajawal", "Noto Sans Arabic", Arial, sans-serif',
  },
};

export function getThemeTokens(presetId: PresetId): ThemeTokens {
  return themeTokens[presetId];
}

export function toThemeStyle(tokens: ThemeTokens): CSSProperties {
  return {
    "--theme-primary": tokens.primary,
    "--theme-on-primary": tokens.onPrimary,
    "--theme-accent": tokens.accent,
    "--theme-background": tokens.background,
    "--theme-surface": tokens.surface,
    "--theme-muted": tokens.muted,
    "--theme-text": tokens.text,
    "--theme-text-muted": tokens.textMuted,
    "--theme-line": tokens.line,
    "--theme-radius": tokens.radius,
    "--theme-font": tokens.font,
  } as CSSProperties;
}
