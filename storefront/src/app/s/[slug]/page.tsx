import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorePreview } from "@/components/storefront/StorePreview";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { getAuthUser } from "@/lib/auth";
import { getPreset } from "@/lib/presets";
import { getStoreBuildPayload } from "@/lib/store-payload-server";
import type { MockLocale } from "@/mock/types";

type StorePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<QueryValues>;
};

export const metadata: Metadata = {
  title: "CommerceForge Store",
};

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const [{ slug }, query, user] = await Promise.all([params, searchParams, getAuthUser()]);
  const payload = await getStoreBuildPayload(slug);
  if (!payload) notFound();

  const preset = getPreset(payload.templateSlug);
  if (!preset) notFound();

  const locale: MockLocale = getLocale(query.lang);

  return (
    <StorePreview
      allowDemoFallback={false}
      dictionary={getDictionary(locale)}
      initialPayload={payload}
      isLiveStore
      locale={locale}
      preset={preset}
      query={{ ...query, store: slug }}
      user={user}
    />
  );
}
