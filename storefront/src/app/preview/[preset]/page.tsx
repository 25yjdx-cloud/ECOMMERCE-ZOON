import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorePreview } from "@/components/storefront/StorePreview";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getPreset, PRESET_ROUTE_IDS } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { getAuthUser } from "@/lib/auth";
import { PreviewStageSwitcher } from "@/components/storefront/PreviewStageSwitcher";

type PreviewPageProps = {
  params: Promise<{ preset: string }>;
  searchParams: Promise<QueryValues>;
};

export function generateStaticParams() {
  return PRESET_ROUTE_IDS.map((preset) => ({ preset }));
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { preset: presetId } = await params;
  const preset = getPreset(presetId);
  return { title: preset ? `Preview ${preset.name.en}` : "Preset not found" };
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const [{ preset: presetId }, query] = await Promise.all([params, searchParams]);
  const preset = getPreset(presetId);
  if (!preset) notFound();

  const locale: MockLocale = getLocale(query.lang);
  const user = await getAuthUser();
  return (
    <>
      <PreviewStageSwitcher current="starter" locale={locale} slug={preset.id} />
      <StorePreview
        dictionary={getDictionary(locale)}
        locale={locale}
        preset={preset}
        query={query}
        user={user}
      />
    </>
  );
}
