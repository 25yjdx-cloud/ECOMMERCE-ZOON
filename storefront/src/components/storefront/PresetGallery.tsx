"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { StaggerGrid, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ShowcasePresetCard } from "./ShowcasePresetCard";
import type { AuthUser } from "@/lib/auth";

type Filter = "all" | "featured" | "readySoon";

export function PresetGallery({
  presets,
  locale,
  dictionary,
  user,
}: {
  presets: readonly Preset[];
  locale: MockLocale;
  dictionary: Dictionary;
  user: AuthUser | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: dictionary.gallery.all },
    { id: "featured", label: dictionary.gallery.featured },
    { id: "readySoon", label: dictionary.gallery.readySoon },
  ];
  const visiblePresets = useMemo(
    () =>
      presets.filter((preset) => {
        if (filter === "featured") return preset.featuredOnHome;
        if (filter === "readySoon") return preset.status === "planned";
        return true;
      }),
    [filter, presets],
  );
  const isComingSoon = filter === "readySoon";

  return (
    <>
      <div className="gallery-filters" role="group" aria-label={dictionary.gallery.title}>
        {filters.map((item) => (
          <button
            aria-pressed={filter === item.id}
            className="filter-chip"
            key={item.id}
            onClick={() => setFilter(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {isComingSoon ? (
        <section className="coming-soon-banner" aria-labelledby="coming-soon-heading">
          <div>
            <span className="eyebrow">{dictionary.gallery.readySoon}</span>
            <h2 id="coming-soon-heading">{dictionary.gallery.comingSoonTitle}</h2>
            <p>{dictionary.gallery.comingSoonDescription}</p>
          </div>
          <ul>
            {dictionary.gallery.comingSoonTemplates.map((name) => <li key={name}>{name}</li>)}
          </ul>
        </section>
      ) : (
        <StaggerGrid className="preset-grid">
          {visiblePresets.map((preset) => (
            <StaggerItem key={preset.id}>
              <ShowcasePresetCard preset={preset} locale={locale} dictionary={dictionary} user={user} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </>
  );
}
