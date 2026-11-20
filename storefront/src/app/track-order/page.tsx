import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, type QueryValues } from "@/i18n/locale";

export const metadata: Metadata = {
  title: "تتبع الطلب | CommerceForge",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  redirect(`/s/demo/track?lang=${locale}`);
}
