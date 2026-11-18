import type { Metadata } from "next";
import { LandingExperience } from "@/components/landing/LandingExperience";
import { getDictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";
import { presets } from "@/lib/presets";

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "CommerceForge | Arabic-first storefronts",
  description: "A shared storefront foundation for independently owned client stores.",
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale: MockLocale = lang === "en" ? "en" : "ar";

  return (
    <LandingExperience
      dictionary={getDictionary(locale)}
      locale={locale}
      presets={presets}
    />
  );
}
