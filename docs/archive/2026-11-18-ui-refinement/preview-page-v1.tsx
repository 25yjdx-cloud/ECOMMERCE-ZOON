import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { MockLocale } from "@/mock/types";
import { getPreset, PRESET_IDS } from "@/lib/presets";
import { StorePreview } from "@/components/storefront/StorePreview";

type PreviewPageProps = {
  params: Promise<{ preset: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export function generateStaticParams() {
  return PRESET_IDS.map((preset) => ({ preset }));
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { preset: presetId } = await params;
  const preset = getPreset(presetId);
  if (!preset) {
    return { title: "القالب غير موجود" };
  }

  return {
    title: `معاينة ${preset.name.ar}`,
    description: `معاينة تجريبية لقالب ${preset.name.ar} ببيانات مؤقتة.`,
  };
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const [{ preset: presetId }, query] = await Promise.all([params, searchParams]);
  const preset = getPreset(presetId);

  if (!preset) {
    notFound();
  }

  const language = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale: MockLocale = language === "en" ? "en" : "ar";

  return <StorePreview locale={locale} preset={preset} />;
}
