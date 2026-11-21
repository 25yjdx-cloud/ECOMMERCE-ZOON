import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StandaloneTemplateActions } from "@/components/manager/StandaloneTemplateActions";
import { DeveloperRefinementQueue } from "@/components/manager/DeveloperRefinementQueue";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale, type QueryValues } from "@/i18n/locale";
import { PRESET_IDS, getPreset } from "@/lib/presets";
import { getAuthToken, getAuthUser, getBackendAuthUrl } from "@/lib/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ExecutiveConsole } from "@/components/manager/ExecutiveConsole";

type RefinementStore = {
  slug: string;
  template_slug: string;
  owner_user_id: number | null;
  store_name: string;
  hosting_mode: "saas" | "client_hosting";
  domain: string | null;
  status: "pending" | "in_progress";
  build_completion: number;
};

type PlatformSummary = {
  client_count: number;
  active_saas_stores: number;
  pending_refinement_count: number;
  monthly_subscription_revenue: number | null;
};

type QuoteLead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  market: "EG" | "SA";
  package_id: string | null;
  message: string | null;
  created_at: string;
};

type MerchantContact = {
  name: string;
  email: string;
  whatsapp_phone: string | null;
  market: "EG" | "SA";
  store_slug: string | null;
};

type UnansweredQuery = {
  question: string;
  locale: "ar" | "en";
  occurrences: number;
  last_asked_at: string;
};

export const metadata: Metadata = {
  title: "CommerceForge — إدارة المنصة",
  robots: { index: false, follow: false },
};

export default async function PlatformManagerPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  const query = await searchParams;
  const locale = getLocale(query.lang);
  const isArabic = locale === "ar";
  const user = await getAuthUser();

  if (!user) redirect(`/login?lang=${locale}&redirect=%2Fmanager`);
  if (user.role !== "super_admin") redirect(`/dashboard?lang=${locale}`);
  const token = await getAuthToken();
  if (!token) redirect(`/login?lang=${locale}&redirect=%2Fmanager`);
  const queueResponse = await fetch(getBackendAuthUrl("api/v1/admin/refinement-queue"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!queueResponse.ok) throw new Error(`Unable to load platform manager data (${queueResponse.status}).`);
  const queuePayload: unknown = await queueResponse.json();
  if (
    !queuePayload
    || typeof queuePayload !== "object"
    || !("data" in queuePayload)
    || !Array.isArray(queuePayload.data)
    || !("summary" in queuePayload)
    || !queuePayload.summary
    || typeof queuePayload.summary !== "object"
    || !("leads" in queuePayload)
    || !Array.isArray(queuePayload.leads)
    || !("merchant_contacts" in queuePayload)
    || !Array.isArray(queuePayload.merchant_contacts)
    || !("unanswered_queries" in queuePayload)
    || !Array.isArray(queuePayload.unanswered_queries)
  ) {
    throw new Error("The platform manager response is invalid.");
  }

  const templates = PRESET_IDS.map((slug) => getPreset(slug)).filter((preset) => preset !== undefined);
  return (
    <div lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <LandingHeader basePath="/manager" dictionary={getDictionary(locale)} locale={locale} query={query} user={user} />
      <main className="manager-page page-shell">
        <ExecutiveConsole locale={locale} />
        <header className="manager-heading">
          <div>
            <BrandLogo className="manager-brand-logo" size={48} variant="horizontal" />
            <span className="eyebrow">{isArabic ? "مساحة مالك المنصة" : "Platform owner workspace"}</span>
            <h1>{isArabic ? "مراجعة المتاجر وتسليمها" : "Store refinement and delivery"}</h1>
            <p>{isArabic ? "يُنشأ 70% من المتجر فوراً، ثم يراجع المطور الهوية والتفاصيل ويؤكد التسليم خلال 24–48 ساعة." : "70% of a store is generated instantly; the developer then reviews the identity and details and confirms delivery within 24–48 hours."}</p>
          </div>
        </header>
        <DeveloperRefinementQueue
          initialStores={queuePayload.data as RefinementStore[]}
          initialSummary={queuePayload.summary as PlatformSummary}
          locale={locale}
        />
        <section className="manager-template-list" aria-labelledby="manager-leads-title">
          <h2 id="manager-leads-title">{isArabic ? "طلبات التنفيذ والعملاء المحتملون" : "Turnkey leads and merchants"}</h2>
          {(queuePayload.leads as QuoteLead[]).map((lead) => (
            <article className="manager-template-row" key={`lead-${lead.id}`}>
              <div>
                <h3>{lead.name} · {lead.market === "EG" ? "🇪🇬 مصر" : "🇸🇦 السعودية"}</h3>
                <p>{lead.email} · {lead.phone} · {lead.package_id ?? (isArabic ? "باقة غير محددة" : "No package selected")}</p>
                {lead.message && <p>{lead.message}</p>}
              </div>
              <a className="button-link secondary" href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} rel="noreferrer" target="_blank">
                {isArabic ? "مراسلة العميل" : "Message lead"}
              </a>
            </article>
          ))}
          {(queuePayload.leads as QuoteLead[]).length === 0 && <p>{isArabic ? "لا توجد طلبات جديدة." : "No new leads."}</p>}
        </section>
        <section className="manager-template-list" aria-labelledby="manager-contacts-title">
          <h2 id="manager-contacts-title">{isArabic ? "بيانات تواصل التجار" : "Merchant contact details"}</h2>
          {(queuePayload.merchant_contacts as MerchantContact[]).map((contact) => (
            <article className="manager-template-row" key={contact.email}>
              <div>
                <h3>{contact.name}</h3>
                <p>{contact.email} · {contact.whatsapp_phone ?? "—"} · {contact.market === "EG" ? "🇪🇬 مصر" : "🇸🇦 السعودية"}</p>
                {contact.store_slug && <p>{isArabic ? "المتجر" : "Store"}: {contact.store_slug}</p>}
              </div>
            </article>
          ))}
        </section>
        <section className="manager-template-list" aria-labelledby="manager-unanswered-title">
          <h2 id="manager-unanswered-title">{isArabic ? "الأسئلة غير المجابة للمساعد" : "Unanswered advisor questions"}</h2>
          {(queuePayload.unanswered_queries as UnansweredQuery[]).map((item) => (
            <article className="manager-template-row" key={`${item.locale}-${item.question}`}>
              <div>
                <p lang={item.locale}>{item.question}</p>
                <small>{isArabic ? "عدد التكرار" : "Occurrences"}: {item.occurrences} · {new Date(item.last_asked_at).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}</small>
              </div>
            </article>
          ))}
        </section>
        <section className="manager-template-list" aria-labelledby="manager-templates-title">
          <h2 id="manager-templates-title">{isArabic ? "ملفات القوالب المستقلة" : "Standalone template files"}</h2>
          {templates.map((preset) => (
            <article className="manager-template-row" key={preset.id}>
              <div>
                <BrandLogo size={30} variant="mark" />
                <h3>{preset.name[locale]}</h3>
                <p>{isArabic ? "معاينة النتيجة النهائية ولوحة الإدارة التجريبية." : "Preview the final store and demo admin panel."}</p>
              </div>
              <div className="manager-template-actions">
                <Link className="button-link secondary" href={`/final-preview/${preset.id}?lang=${locale}`}>{isArabic ? "معاينة النتيجة النهائية" : "Final preview"}</Link>
                <StandaloneTemplateActions slug={preset.id} />
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
