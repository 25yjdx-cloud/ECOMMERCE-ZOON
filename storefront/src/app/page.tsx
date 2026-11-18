import Link from "next/link";
import { PresetCard } from "@/components/storefront/PresetCard";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { getFeaturedPresets } from "@/lib/presets";

export default function HomePage() {
  const featuredPresets = getFeaturedPresets();

  return (
    <div className="page-shell">
      <SiteHeader locale="ar" basePath="/" />
      <main>
        <section className="gallery-hero" aria-labelledby="gallery-title">
          <span className="eyebrow">CommerceForge / معرض القوالب</span>
          <h1 className="page-heading" id="gallery-title">متجرك القادم يبدأ من هنا.</h1>
          <p className="page-description">
            اختر اتجاهًا بصريًا يناسب نشاطك، واستكشف معاينة تجريبية قبل بدء تخصيص متجرك.
          </p>
          <div>
            <Link className="button-link" href="/gallery">استكشف القوالب الخمسة</Link>
          </div>
        </section>
        <section aria-labelledby="featured-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">مختارة لك</span>
              <h2 id="featured-title">قوالب مميزة</h2>
            </div>
            <Link className="text-link" href="/gallery">عرض الكل ←</Link>
          </div>
          <div className="preset-grid">
            {featuredPresets.map((preset) => <PresetCard key={preset.id} preset={preset} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
