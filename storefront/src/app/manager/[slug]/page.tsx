import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/locale";
import { getPreset, PRESET_IDS } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import { getAuthUser } from "@/lib/auth";
import { ManagerWorkspace } from "@/components/manager/ManagerWorkspace";
import { PreviewTopbar } from "@/components/storefront/PreviewTopbar";
import { Footer } from "@/components/landing/Footer";

type ManagerPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

export function generateStaticParams() {
  return PRESET_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ManagerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const preset = getPreset(slug);

  return {
    title: preset ? `${preset.name.en} manager` : "Store manager",
    robots: { index: false, follow: false },
  };
}

export default async function ManagerPage({ params, searchParams }: ManagerPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preset = getPreset(slug);
  if (!preset) notFound();

  const lang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale: MockLocale = getLocale(lang);
  const dictionary = getDictionary(locale);
  const user = await getAuthUser();

  if (!user || user.role !== "super_admin") {
    const loginUrl = new URLSearchParams({
      lang: locale,
      redirect: `/manager/${slug}`,
      notice: "owner-only",
    });
    redirect(`/login?${loginUrl.toString()}`);
  }

  return (
    <div className="manager-page" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <PreviewTopbar
        dictionary={dictionary}
        locale={locale}
        preset={preset}
        query={{ lang: locale }}
        user={user}
      />
      <main className="page-shell manager-content">
        <div className="manager-heading">
          <div>
            <span className="eyebrow">{preset.name[locale]}</span>
            <h1>{dictionary.manager.title}</h1>
            <p>{dictionary.manager.intro}</p>
          </div>
        </div>
        {process.env.NODE_ENV === "development" && (
          <section className="dev-build-indicator" role="status">
            <span>main</span>
            <span>3006</span>
            <span>API 8001</span>
          </section>
        )}
        <section className="manager-connection" role="status">
          <span aria-hidden="true" className="manager-status-mark">!</span>
          <div>
            <h2>{dictionary.manager.connectionTitle}</h2>
            <p>{dictionary.manager.connectionText}</p>
          </div>
        </section>
        <ManagerWorkspace locale={locale} slug={preset.id} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
