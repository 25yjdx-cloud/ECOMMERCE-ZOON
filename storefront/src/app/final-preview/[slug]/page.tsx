import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewStageSwitcher } from "@/components/storefront/PreviewStageSwitcher";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getPreset, PRESET_IDS, type PresetId } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import ClassicStandalone from "@/standalone-templates/classic.standalone";
import NabdStandalone from "@/standalone-templates/sports.standalone";
import FashionStandalone from "@/standalone-templates/fashion.standalone";
import FurnitureStandalone from "@/standalone-templates/furniture.standalone";
import LocalBrandStandalone from "@/standalone-templates/local-brand.standalone";

type StandaloneProps = { locale?: MockLocale };
type FinalPreviewProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<QueryValues>;
};

const standaloneTemplates: Record<PresetId, ComponentType<StandaloneProps>> = {
  classic: ClassicStandalone,
  nabd: NabdStandalone,
  fashion: FashionStandalone,
  furniture: FurnitureStandalone,
  "local-brand": LocalBrandStandalone,
};

export function generateStaticParams() {
  return PRESET_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FinalPreviewProps): Promise<Metadata> {
  const { slug } = await params;
  const preset = getPreset(slug);
  return { title: preset ? `${preset.name.en} — final store preview` : "Store preview not found" };
}

export default async function FinalPreviewPage({ params, searchParams }: FinalPreviewProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preset = getPreset(slug);
  if (!preset) notFound();

  const locale = getLocale(query.lang);
  const Template = standaloneTemplates[preset.id];

  return (
    <>
      <PreviewStageSwitcher current="final" locale={locale} slug={preset.id} />
      <Template locale={locale} />
    </>
  );
}
