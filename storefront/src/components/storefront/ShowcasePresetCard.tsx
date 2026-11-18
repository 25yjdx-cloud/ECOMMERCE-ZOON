import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale } from "@/mock/types";
import { PresetIcon } from "./PresetIcon";

type ShowcasePresetCardProps = {
  preset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
};

export function ShowcasePresetCard({ preset, locale, dictionary }: ShowcasePresetCardProps) {
  const gallery = dictionary.gallery;
  const products = mockData[preset.id].products.slice(0, 4);
  const formatter = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  });

  return (
    <article className="preset-card" data-preset={preset.id}>
      <div className="mini-store" aria-label={`${preset.name[locale]} — ${gallery.storefrontPreview}`}>
        <div className="mini-store-head">
          <strong>{gallery.storePlaceholder}</strong>
          <nav aria-label={dictionary.navigation.storeHome}>
            <span>{dictionary.navigation.storeHome}</span>
            <span>{dictionary.navigation.shop}</span>
            <span>{dictionary.navigation.contactPlaceholder}</span>
          </nav>
          <PresetIcon preset={preset.id} size={16} />
        </div>
        <div className="mini-store-hero">
          <strong>{preset.name[locale]}</strong>
          <span>{gallery.presetDescription[preset.id]}</span>
        </div>
        <div className="mini-tile-grid">
          {products.map((product) => (
            <div className="mini-tile" key={product.id}>
              <span className="mini-tile-art" aria-label={dictionary.store.placeholder}>
                <PresetIcon preset={preset.id} size={20} />
              </span>
              <strong>{product.name[locale]}</strong>
              <span>{formatter.format(product.price)}</span>
              <span className="mini-badge">{gallery.badgeNew}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="preset-card-content">
        <div className="preset-title-row">
          <div>
            <h3 lang="ar">{preset.name.ar}</h3>
            <p lang="en" dir="ltr">{preset.name.en}</p>
          </div>
          <span className="status-badge">{gallery.statusPlanned}</span>
        </div>
        <p className="preset-description">{gallery.presetDescription[preset.id]}</p>
        <div className="preset-actions">
          <Link className="button-link accent" href={`/preview/${preset.id}`}>
            {gallery.livePreview}
          </Link>
          <Link className="button-link secondary" href={`/preview/${preset.id}`}>
            {gallery.choose}
          </Link>
        </div>
      </div>
    </article>
  );
}
