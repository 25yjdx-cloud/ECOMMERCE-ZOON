import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { ExecutiveConsole } from "@/components/manager/ExecutiveConsole";
import { getAuthUser } from "@/lib/auth";
import { getLocale, type QueryValues } from "@/i18n/locale";

export const metadata: Metadata = {
  title: "CommerceForge — غرفة القيادة",
  robots: { index: false, follow: false },
};

export default async function PlatformManagerPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const user = await getAuthUser();

  if (!user) redirect("/login?lang=" + locale + "&redirect=%2Fmanager");
  if (user.role !== "super_admin") redirect("/dashboard?lang=" + locale);

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="manager-world">
      <ExecutiveConsole locale={locale} ownerName={user.name} user={user} />
      <Footer locale={locale} />
    </div>
  );
}
