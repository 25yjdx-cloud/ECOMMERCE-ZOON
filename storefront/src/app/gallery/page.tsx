import type { Metadata } from "next";
import { PresetGallery } from "@/components/storefront/PresetGallery";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LocaleDocumentAttributes } from "@/components/storefront/LocaleDocumentAttributes";
import { getDictionary } from "@/i18n/dictionaries";
import { presets } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { getAuthUser } from "@/lib/auth";

type GalleryPageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "CommerceForge presets",
  description: "Explore five storefront presets and live mock previews.",
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const query = await searchParams;
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale: MockLocale = lang === "en" ? "en" : "ar";
  const dictionary = getDictionary(locale);
  const user = await getAuthUser();

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <LocaleDocumentAttributes locale={locale} />
      <LandingHeader basePath="/gallery" dictionary={dictionary} locale={locale} user={user} />
      <main className="page-shell">
      <section className="gallery-page-heading" id="presets" aria-labelledby="gallery-title">
        <span className="eyebrow">{dictionary.gallery.eyebrow}</span>
        <h1 className="page-heading" id="gallery-title">{dictionary.gallery.title}</h1>
        <p className="page-description">{dictionary.gallery.description}</p>
      </section>
      <PresetGallery dictionary={dictionary} locale={locale} presets={presets} user={user} />
      </main>
    </div>
  );
}
