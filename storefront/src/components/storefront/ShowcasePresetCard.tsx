import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Preset } from "@/lib/presets";
import { mockData } from "@/mock";
import type { MockLocale } from "@/mock/types";
import { PresetIcon } from "./PresetIcon";
import { ProductArtwork } from "./ProductArtwork";
import type { AuthUser } from "@/lib/auth";

type ShowcasePresetCardProps = {
  preset: Preset;
  locale: MockLocale;
  dictionary: Dictionary;
  user?: AuthUser | null;
};

export function ShowcasePresetCard({ preset, locale, dictionary, user = null }: ShowcasePresetCardProps) {
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
                <ProductArtwork preset={preset.id} productId={product.id} />
              </span>
              <strong>{product.name[locale]}</strong>
              <span>{formatter.format(product.price)}</span>
              <span className="mini-badge">{gallery.badgeNew}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="preset-card-scrim" aria-hidden="true" />
      <span className="preset-card-badge">
        {preset.featuredOnHome ? gallery.featuredBadge : gallery.freeBadge}
      </span>
      <div className="preset-card-content">
        <div className="preset-title-row">
          <div>
            <h3>{preset.name[locale]}</h3>
          </div>
        </div>
        <p className="preset-description">{gallery.presetDescription[preset.id]}</p>
        <div className="preset-card-meta">
          <span>{gallery.statusPlanned}</span>
          <span>{gallery.categoryTag}</span>
        </div>
        <div className="preset-actions">
          <Link className="button-link preset-live-button" href={`/preview/${preset.id}?lang=${locale}`}>
            {gallery.livePreview} {locale === "ar" ? "←" : "→"}
          </Link>
          {user?.role === "super_admin" ? (
            <Link aria-label={gallery.customize} className="preset-customize-button" href={`/manager/${preset.id}?lang=${locale}`}>
              ✎
            </Link>
          ) : (
            <Link aria-label={gallery.customizeLogin} className="preset-customize-button" href={`/login?lang=${locale}&template=${preset.id}`}>
              ✎
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
