import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewStageSwitcher } from "@/components/storefront/PreviewStageSwitcher";
import { StandaloneAdminDemo } from "@/components/storefront/StandaloneAdminDemo";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getPreset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";

type AdminDemoProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<QueryValues>;
};

export const metadata: Metadata = {
  title: "Store admin demo",
  robots: { index: false, follow: false },
};

export default async function AdminDemoPage({ params, searchParams }: AdminDemoProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preset = getPreset(slug);
  if (!preset) notFound();

  const locale: MockLocale = getLocale(query.lang);
  return (
    <>
      <PreviewStageSwitcher current="admin" locale={locale} slug={preset.id} />
      <StandaloneAdminDemo locale={locale} storeName={preset.name[locale]} />
    </>
  );
}
