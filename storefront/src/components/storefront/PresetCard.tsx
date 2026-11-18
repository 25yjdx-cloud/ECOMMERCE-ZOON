import Link from "next/link";
import type { Preset } from "@/lib/presets";

type PresetCardProps = {
  preset: Preset;
};

export function PresetCard({ preset }: PresetCardProps) {
  return (
    <article className="preset-card">
      <div className="preset-art" aria-hidden="true">
        <span>CommerceForge / lifestyle</span>
      </div>
      <div className="preset-card-content">
        <div className="preset-title-row">
          <div>
            <h3 lang="ar">{preset.name.ar}</h3>
            <p lang="en" dir="ltr">{preset.name.en}</p>
          </div>
          <span className="status-badge">{preset.status === "planned" ? "مخطط" : preset.status}</span>
        </div>
        <Link className="button-link secondary" href={`/preview/${preset.id}`}>
          معاينة القالب
        </Link>
      </div>
    </article>
  );
}
