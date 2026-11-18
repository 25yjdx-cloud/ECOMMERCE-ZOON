import type { Metadata } from "next";
import { PresetCard } from "@/components/storefront/PresetCard";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { presets } from "@/lib/presets";

export const metadata: Metadata = {
  title: "كل القوالب",
  description: "استكشف قوالب CommerceForge الخمسة ومعايناتها التجريبية.",
};

export default function GalleryPage() {
  return (
    <div className="page-shell">
      <SiteHeader locale="ar" basePath="/gallery" />
      <main>
        <section className="gallery-page-heading" aria-labelledby="all-presets-title">
          <span className="eyebrow">معرض CommerceForge</span>
          <h1 className="page-heading" id="all-presets-title">كل القوالب</h1>
          <p className="page-description">
            خمسة اتجاهات تجريبية، بعائلة تصميم مشتركة وإعدادات تناسب مجالات مختلفة.
          </p>
        </section>
        <section className="preset-grid" aria-label="قائمة القوالب">
          {presets.map((preset) => <PresetCard key={preset.id} preset={preset} />)}
        </section>
      </main>
    </div>
  );
}
