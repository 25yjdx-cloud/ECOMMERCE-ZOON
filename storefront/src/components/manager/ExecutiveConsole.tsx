"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MockLocale } from "@/mock/types";

type ZoneCounts = Record<"marketing" | "merchant_dashboard" | "storefront" | "other", number>;
type Metric = {
  online_total: number;
  online_by_zone: ZoneCounts;
  stores_total: number;
  stores_pending_review: number;
  plans: { free: number; paid: number };
  confirmed_revenue: number | null;
  gmv: number;
  orders_total: number;
  series: Array<{ day: string; event_type: string; total: number }>;
  generated_at: string;
  google_allowlist_count: number;
  manager_lock_ready: boolean;
};
type Event = { id: number; type: string; store_slug: string | null; subject: string | null; created_at: string };
type SecurityLog = { id: number; event: string; severity: string; ip_address: string | null; identifier_hash: string | null; created_at: string };
type Store = { slug: string; store_name: string; template_slug: string; plan: string; status: string; build_completion: number; owner_name: string | null; owner_email: string | null; config: Record<string, unknown> };
type Tab = "overview" | "studio" | "stores" | "templates" | "plans" | "sheets" | "security";

const tabs: Array<{ id: Tab; ar: string; en: string }> = [
  { id: "overview", ar: "القيادة والرصد المباشر", en: "Live overview" },
  { id: "studio", ar: "الاستوديو المرئي 70/30", en: "Visual studio" },
  { id: "stores", ar: "المتاجر والتجار", en: "Stores & merchants" },
  { id: "templates", ar: "القوالب", en: "Templates" },
  { id: "plans", ar: "الخطط والتسعير", en: "Plans" },
  { id: "sheets", ar: "تصدير ومزامنة Sheets", en: "Sheets & export" },
  { id: "security", ar: "الأمان وسجل التدقيق", en: "Security & audit" },
];

const labels: Record<string, { ar: string; en: string }> = {
  new_signup: { ar: "تسجيل جديد", en: "New signup" },
  plan_free_activated: { ar: "تفعيل الخطة المجانية", en: "Free plan activated" },
  plan_paid_confirmed: { ar: "تأكيد اشتراك مدفوع", en: "Paid plan confirmed" },
  store_generated: { ar: "إنشاء متجر", en: "Store generated" },
  template_generated: { ar: "إنشاء قالب", en: "Template generated" },
  order_created: { ar: "طلب جديد", en: "New order" },
  return_requested: { ar: "طلب استرجاع", en: "Return requested" },
  store_visual_updated: { ar: "تحديث تصميم متجر", en: "Store design updated" },
  store_suspended: { ar: "إيقاف متجر", en: "Store suspended" },
  store_activated: { ar: "تفعيل متجر", en: "Store activated" },
  template_status_changed: { ar: "تغيير حالة قالب", en: "Template status changed" },
};

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { Accept: "application/json", "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message ?? `Request failed (${response.status})`);
  return payload as T;
}

export function ExecutiveConsole({ locale }: { locale: MockLocale }) {
  const ar = locale === "ar";
  const [tab, setTab] = useState<Tab>("overview");
  const [metric, setMetric] = useState<Metric | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [chartMode, setChartMode] = useState<"new_signup" | "stores" | "gmv">("new_signup");
  const [chartDays, setChartDays] = useState<7 | 30>(7);
  const [draft, setDraft] = useState({ store_name: "", store_name_en: "", hero_title: "", hero_title_en: "", hero_subtitle: "", hero_subtitle_en: "", hero_cta: "", hero_cta_en: "", primary_color: "#F59E0B", button_color: "#F59E0B", background_color: "#FFFFFF", button_width: 220, button_height: 52, button_font_size: 16, button_radius: 12, trust_badges_text: "", domain: "", custom_domain_status: "pending" as "pending" | "active" | "suspended" });
  const [previewLocale, setPreviewLocale] = useState<"ar" | "en">("ar");
  const lastEventId = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const [radar, eventResult, storeResult, auditResult] = await Promise.all([
        json<Metric>("/api/manager/telemetry/live-radar"),
        json<{ data: Event[] }>("/api/manager/telemetry/events"),
        json<{ data: Store[] }>(`/api/manager/telemetry/stores${search ? `?q=${encodeURIComponent(search)}` : ""}`),
        json<{ security: SecurityLog[] }>("/api/manager/telemetry/audit"),
      ]);
      setMetric(radar);
      setEvents(eventResult.data);
      setStores(storeResult.data);
      setSecurityLogs(auditResult.security);
      const newest = eventResult.data.at(-1);
      if (newest && lastEventId.current && newest.id > lastEventId.current && ["new_signup", "plan_paid_confirmed", "store_generated"].includes(newest.type)) {
        const label = labels[newest.type]?.[locale] ?? newest.type;
        setToast(ar ? `حدث جديد: ${label}${newest.subject ? ` · ${newest.subject}` : ""}` : `New activity: ${label}${newest.subject ? ` · ${newest.subject}` : ""}`);
      }
      if (newest) lastEventId.current = Math.max(lastEventId.current, newest.id);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not refresh platform data.");
    }
  }, [search]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!selectedSlug) return;
    const store = stores.find((item) => item.slug === selectedSlug);
    if (!store) return;
    setDraft({
      store_name: String(store.config.store_name ?? store.store_name),
      store_name_en: String(store.config.store_name_en ?? store.store_name),
      hero_title: String(store.config.hero_title ?? ""),
      hero_title_en: String(store.config.hero_title_en ?? ""),
      hero_subtitle: String(store.config.hero_subtitle ?? ""),
      hero_subtitle_en: String(store.config.hero_subtitle_en ?? ""),
      hero_cta: String(store.config.hero_cta ?? ""),
      hero_cta_en: String(store.config.hero_cta_en ?? ""),
      primary_color: String(store.config.primary_color ?? "#F59E0B"),
      button_color: String(store.config.button_color ?? store.config.primary_color ?? "#F59E0B"),
      background_color: String(store.config.background_color ?? "#FFFFFF"),
      button_width: Number(store.config.button_width ?? 220),
      button_height: Number(store.config.button_height ?? 52),
      button_font_size: Number(store.config.button_font_size ?? 16),
      button_radius: Number(store.config.button_radius ?? 12),
      trust_badges_text: Array.isArray(store.config.trust_badges) ? (store.config.trust_badges as Array<{ar:string;en:string}>).map((badge) => `${badge.ar} | ${badge.en}`).join("\n") : "",
      domain: String(store.config.domain ?? ""),
      custom_domain_status: store.config.custom_domain_status === "active" || store.config.custom_domain_status === "suspended" ? store.config.custom_domain_status : "pending",
    });
  // Apply persisted values when selecting a store, but do not overwrite edits on the 10s refresh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  const selectedStore = stores.find((store) => store.slug === selectedSlug) ?? null;
  const chartPoints = useMemo(() => {
    const byDay = new Map<string, number>();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - chartDays + 1);
    for (const item of metric?.series ?? []) {
      if (item.event_type !== chartMode || new Date(`${item.day}T00:00:00`) < cutoff) continue;
      byDay.set(item.day, (byDay.get(item.day) ?? 0) + item.total);
    }
    const values = [...byDay.values()].slice(-chartDays);
    if (values.length < 2) return "0,76 100,76";
    const max = Math.max(...values, 1);
    return values.map((value, index) => `${(index / (values.length - 1)) * 100},${76 - (value / max) * 66}`).join(" ");
  }, [chartDays, chartMode, metric?.series]);

  const preview = useCallback(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(".executive-preview iframe");
    const trust_badges = draft.trust_badges_text.split("\n").map((line) => line.split("|").map((part) => part.trim())).filter((parts) => parts.length === 2 && parts[0] && parts[1]).map(([arText, enText]) => ({ ar: arText, en: enText }));
    iframe?.contentWindow?.postMessage({ type: "cf-manager-preview", config: { ...draft, trust_badges } }, window.location.origin);
  }, [draft]);

  useEffect(() => { preview(); }, [preview]);

  async function saveVisualConfig() {
    if (!selectedSlug) return;
    try {
      const trust_badges = draft.trust_badges_text.split("\n").map((line) => line.split("|").map((part) => part.trim())).filter((parts) => parts.length === 2 && parts[0] && parts[1]).map(([arText, enText]) => ({ ar: arText, en: enText }));
      await json(`/api/manager/telemetry/store-config:${encodeURIComponent(selectedSlug)}`, { method: "PUT", body: JSON.stringify({ ...draft, trust_badges }) });
      setSavedAt(new Date().toLocaleTimeString());
      setToast(ar ? "حُفظ التخصيص على الخادم." : "Store customization saved.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    }
  }

  async function setStoreStatus(store: Store) {
    const next = store.status === "suspended" ? "active" : "suspended";
    try {
      await json(`/api/manager/telemetry/store-config:${encodeURIComponent(store.slug)}`, { method: "PUT", body: JSON.stringify({ subscription_status: next }) });
      setToast(ar ? (next === "active" ? "تم تفعيل المتجر." : "تم إيقاف المتجر.") : `Store ${next}.`);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Store update failed."); }
  }

  async function csv(dataset: "stores" | "events" | "orders") {
    const response = await fetch(`/api/manager/exports/${dataset}`, { cache: "no-store" });
    if (!response.ok) { setError(ar ? "تعذر تصدير البيانات." : "Export failed."); return; }
    const blob = await response.blob();
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `commerceforge-${dataset}.csv`; link.click(); URL.revokeObjectURL(link.href);
  }

  async function sendTestSync() {
    try {
      const result = await json<{ sent: boolean; message: string }>("/api/manager/integrations/google-sheets", { method: "POST", body: JSON.stringify({ test: true }) });
      setToast(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Sync test failed."); }
  }

  return (
    <section className="executive-console" dir={ar ? "rtl" : "ltr"}>
      <header className="executive-commandbar">
        <div><span className="executive-live-dot" /><strong>{ar ? `متواجدون الآن: ${metric?.online_total ?? "—"}` : `Online now: ${metric?.online_total ?? "—"}`}</strong><small>{ar ? `API 8001 · ${metric ? "متصل" : "غير متصل"}` : `API 8001 · ${metric ? "Connected" : "Offline"}`}</small></div>
        <input aria-label={ar ? "بحث سريع" : "Global search"} onChange={(event) => setSearch(event.target.value)} placeholder={ar ? "ابحث بالمتجر أو الاسم أو البريد" : "Search store, owner, or email"} value={search} />
        <button onClick={() => void refresh()} type="button">{ar ? "تحديث الآن" : "Refresh"}</button>
      </header>
      <nav className="executive-rail" aria-label={ar ? "أقسام غرفة القيادة" : "Executive modules"}>
        {tabs.map((item) => <button aria-current={tab === item.id ? "page" : undefined} key={item.id} onClick={() => setTab(item.id)} type="button">{ar ? item.ar : item.en}</button>)}
      </nav>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {toast && <p className="executive-toast" role="status" onAnimationEnd={() => setToast("")}>{toast}</p>}

      {tab === "overview" && <>
        <div className="executive-kpis">
          <article><span>{ar ? "المتواجدون الآن" : "Online users"}</span><strong>{metric?.online_total ?? "—"}</strong><small>{ar ? `تسويق ${metric?.online_by_zone.marketing ?? 0} · تجار ${metric?.online_by_zone.merchant_dashboard ?? 0} · متاجر ${metric?.online_by_zone.storefront ?? 0}` : `Marketing ${metric?.online_by_zone.marketing ?? 0} · Merchants ${metric?.online_by_zone.merchant_dashboard ?? 0} · Storefront ${metric?.online_by_zone.storefront ?? 0}`}</small></article>
          <article><span>{ar ? "المتاجر / المراجعة" : "Stores / review queue"}</span><strong>{metric?.stores_total ?? "—"}<i>{metric?.stores_pending_review ?? "—"}</i></strong><small>{ar ? "مصدرها قاعدة البيانات" : "Live database totals"}</small></article>
          <article><span>{ar ? "الخطة المجانية / المدفوعة" : "Free / paid plans"}</span><strong>{metric?.plans.free ?? "—"}<i>{metric?.plans.paid ?? "—"}</i></strong><small>{ar ? "إيراد مؤكد" : "Confirmed revenue"}: {metric?.confirmed_revenue == null ? (ar ? "غير متصل" : "Not connected") : metric.confirmed_revenue}</small></article>
          <article><span>{ar ? "إجمالي قيمة الطلبات GMV" : "Platform GMV"}</span><strong>{metric ? metric.gmv.toLocaleString() : "—"}</strong><small>{ar ? "إجمالي الطلبات" : "Orders"}: {metric?.orders_total ?? "—"}</small></article>
        </div>
        <div className="executive-columns">
          <article className="executive-panel"><h2>{ar ? "النمو ونشاط المنصة" : "Platform activity"}</h2><div className="executive-chart-controls"><select aria-label={ar ? "مقياس المخطط" : "Chart metric"} onChange={(event) => setChartMode(event.target.value as typeof chartMode)} value={chartMode}><option value="new_signup">{ar ? "التسجيلات الجديدة" : "New signups"}</option><option value="stores">{ar ? "المتاجر المنشأة" : "Stores created"}</option><option value="gmv">GMV</option></select><button onClick={() => setChartDays(7)} aria-pressed={chartDays === 7} type="button">7 {ar ? "أيام" : "days"}</button><button onClick={() => setChartDays(30)} aria-pressed={chartDays === 30} type="button">30 {ar ? "يومًا" : "days"}</button></div><svg className="executive-chart" viewBox="0 0 100 80" role="img" aria-label={ar ? "مخطط حقيقي من قاعدة البيانات" : "Live database chart"}><polyline points={chartPoints} fill="none" stroke="#F59E0B" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><small>{ar ? "تُقرأ السلسلة من أحداث المنصة والمتاجر والطلبات." : "Series comes from recorded events, stores, and orders."}</small></article>
          <article className="executive-panel"><h2>{ar ? "بث الأحداث المباشر" : "Live event stream"}</h2><div className="executive-events">{events.slice(-12).reverse().map((event) => <div key={event.id}><b>{labels[event.type]?.[locale] ?? event.type}</b><span>{event.subject ?? event.store_slug ?? "—"}</span><time>{new Date(event.created_at).toLocaleTimeString(ar ? "ar-EG" : "en-US")}</time><a href={event.store_slug ? `/manager/${event.store_slug}` : "/manager"}>{ar ? "فتح" : "Review"}</a></div>)}{events.length === 0 && <p>{ar ? "لا توجد أحداث مسجلة بعد." : "No events have been recorded yet."}</p>}</div></article>
        </div>
      </>}

      {tab === "studio" && <div className="executive-studio">
        <aside className="executive-panel executive-controls">
          <label>{ar ? "اختر متجرًا" : "Select store"}<select onChange={(event) => setSelectedSlug(event.target.value)} value={selectedSlug}><option value="">{ar ? "اختر متجرًا" : "Choose a store"}</option>{stores.map((store) => <option key={store.slug} value={store.slug}>{store.store_name} · {store.slug}</option>)}</select></label>
          {selectedStore && <>
            <div className="executive-chart-controls"><button aria-pressed={previewLocale === "ar"} onClick={() => setPreviewLocale("ar")} type="button">العربية</button><button aria-pressed={previewLocale === "en"} onClick={() => setPreviewLocale("en")} type="button">English</button></div>
            {(["store_name", "store_name_en", "hero_title", "hero_title_en", "hero_subtitle", "hero_subtitle_en", "hero_cta", "hero_cta_en"] as const).map((key) => <label key={key}>{({ store_name: ar ? "اسم المتجر بالعربية" : "Store name (Arabic)", store_name_en: "Store name (English)", hero_title: ar ? "العنوان الرئيسي بالعربية" : "Hero title (Arabic)", hero_title_en: "Hero title (English)", hero_subtitle: ar ? "الوصف بالعربية" : "Subtitle (Arabic)", hero_subtitle_en: "Subtitle (English)", hero_cta: ar ? "نص زر الشراء بالعربية" : "CTA label (Arabic)", hero_cta_en: "CTA label (English)" })[key]}<input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
            <label>{ar ? "مزايا المتجر (سطر: عربي | English)" : "Trust badges (one per line: Arabic | English)"}<textarea rows={3} value={draft.trust_badges_text} onChange={(event) => setDraft({ ...draft, trust_badges_text: event.target.value })} /></label>
            <label>{ar ? "لون الهوية" : "Brand color"}<input type="color" value={draft.primary_color} onChange={(event) => setDraft({ ...draft, primary_color: event.target.value })} /></label>
            <label>{ar ? "لون زر الشراء" : "CTA button color"}<input type="color" value={draft.button_color} onChange={(event) => setDraft({ ...draft, button_color: event.target.value })} /></label>
            <label>{ar ? "لون الخلفية" : "Background color"}<input type="color" value={draft.background_color} onChange={(event) => setDraft({ ...draft, background_color: event.target.value })} /></label>
            <label>{ar ? "الدومين" : "Domain"}<input value={draft.domain} onChange={(event) => setDraft({ ...draft, domain: event.target.value })} placeholder="shop.example.com" /></label>
            {(["button_width", "button_height", "button_font_size", "button_radius"] as const).map((key) => <label key={key}>{({ button_width: ar ? "عرض الزر" : "Button width", button_height: ar ? "ارتفاع الزر" : "Button height", button_font_size: ar ? "حجم الخط" : "Font size", button_radius: ar ? "استدارة الحواف" : "Corner radius" })[key]}<input type="range" min={key === "button_width" ? 120 : key === "button_height" ? 36 : key === "button_font_size" ? 12 : 0} max={key === "button_width" ? 520 : key === "button_height" ? 100 : key === "button_font_size" ? 28 : 48} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })} /><output>{draft[key]} px</output></label>)}
            <button className="button-link" onClick={() => void saveVisualConfig()} type="button">{ar ? "حفظ تعديلات المتجر" : "Save store design"}</button><small>{ar ? "يحفظ الدومين كإعداد؛ حالة الاتصال DNS تظل قيد المراجعة." : "Domain is saved as configuration; DNS activation remains pending review."}</small>{savedAt && <small>{ar ? "آخر حفظ" : "Saved"}: {savedAt}</small>}
          </>}
        </aside>
        <div className="executive-preview executive-panel">{selectedStore ? <iframe onLoad={preview} title={ar ? `معاينة ${selectedStore.store_name}` : `Preview ${selectedStore.store_name}`} src={`/s/${encodeURIComponent(selectedStore.slug)}?lang=${previewLocale}&manager_preview=1`} /> : <p>{ar ? "اختر متجرًا لفتح المعاينة التفاعلية." : "Choose a store to open its interactive preview."}</p>}</div>
      </div>}

      {tab === "stores" && <section className="executive-panel"><h2>{ar ? "دليل المتاجر المباشر" : "Live stores directory"}</h2>{stores.map((store) => <article className="executive-store-row" key={store.slug}><div><strong>{store.store_name}</strong><small>{store.slug} · {store.plan} · {store.status} · {store.build_completion}%</small><small>{store.owner_name} · {store.owner_email}</small></div><button onClick={() => void setStoreStatus(store)} type="button">{ar ? (store.status === "suspended" ? "تفعيل" : "إيقاف") : (store.status === "suspended" ? "Activate" : "Suspend")}</button><a className="button-link secondary" href={`/manager/${store.slug}`}>{ar ? "الاستوديو" : "Open studio"}</a><a className="button-link secondary" href={`/s/${store.slug}`} target="_blank">{ar ? "معاينة المتجر" : "Preview store"}</a></article>)}</section>}

      {tab === "templates" && <section className="executive-panel"><h2>{ar ? "القوالب المسجلة في المنصة" : "Platform templates"}</h2><p>{ar ? "هذه القوالب تُقرأ من سجل قاعدة البيانات." : "Templates below come from the live database."}</p><TemplateCatalog locale={locale} /></section>}
      {tab === "plans" && <section className="executive-panel"><h2>{ar ? "الخطط والاشتراكات الحالية" : "Current plans and subscriptions"}</h2><p>{ar ? `مجاني: ${metric?.plans.free ?? "—"} · مدفوع: ${metric?.plans.paid ?? "—"} · إيراد مؤكد: ${metric?.confirmed_revenue ?? (ar ? "غير متصل" : "not connected")}` : `Free: ${metric?.plans.free ?? "—"} · Paid: ${metric?.plans.paid ?? "—"} · Confirmed revenue: ${metric?.confirmed_revenue ?? "not connected"}`}</p><p>{ar ? "لا يوجد موصل فوترة في قاعدة البيانات الحالية؛ لا تُعرض أرقام إيراد تقديرية." : "No billing provider is configured in the current schema; estimated revenue is not shown."}</p></section>}
      {tab === "sheets" && <section className="executive-panel"><h2>{ar ? "مزامنة Google Sheets وتصدير CSV" : "Google Sheets sync and CSV export"}</h2><p>{ar ? "أدخل رابط Webhook من Google Apps Script أو Zapier أو Make ليُرسل إليه كل حدث جديد." : "Add a webhook URL from Google Apps Script, Zapier, or Make to receive each new event."}</p><SheetsSettings locale={locale} onTest={() => void sendTestSync()} /><div className="executive-actions"><button onClick={() => void csv("stores")} type="button">{ar ? "تصدير المتاجر CSV" : "Export stores CSV"}</button><button onClick={() => void csv("events")} type="button">{ar ? "تصدير الأحداث CSV" : "Export events CSV"}</button><button onClick={() => void csv("orders")} type="button">{ar ? "تصدير الطلبات CSV" : "Export orders CSV"}</button></div></section>}
      {tab === "security" && <section className="executive-panel"><h2>{ar ? "قفل حسابي Google وسجل التدقيق" : "Google account lock and audit log"}</h2><p>{ar ? `الحالة: ${metric?.manager_lock_ready ? "مهيأ — عنوانان" : `مغلق بأمان — ${metric?.google_allowlist_count ?? 0} من 2`}` : `Lock: ${metric?.manager_lock_ready ? "Ready — two addresses" : `Fail-closed — ${metric?.google_allowlist_count ?? 0} of 2`}`}</p><p>{ar ? "لا تُعرض عناوين القائمة في المتصفح." : "Allowlisted addresses are never sent to the browser."}</p><div className="executive-events">{securityLogs.map((log) => <div key={log.id}><b>{log.event}</b><span>{log.severity} · {log.ip_address ?? "—"}</span><time>{new Date(log.created_at).toLocaleString(ar ? "ar-EG" : "en-US")}</time><small>{log.identifier_hash?.slice(0, 12) ?? "—"}</small></div>)}</div></section>}
    </section>
  );
}

function TemplateCatalog({ locale }: { locale: MockLocale }) {
  const [templates, setTemplates] = useState<Array<{ slug: string; name_ar: string; name_en: string; status: string; active_store_count: number }>>([]);
  const load = useCallback(() => fetch("/api/manager/templates", { cache: "no-store" }).then((response) => response.json()).then((value) => setTemplates(value.data ?? [])), []);
  useEffect(() => { void load().catch(() => setTemplates([])); }, [load]);
  async function toggle(template: { slug: string; status: string }) {
    const status = template.status === "live" ? "draft" : "live";
    const response = await fetch("/api/manager/templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: template.slug, status }) });
    if (response.ok) await load();
  }
  return <div className="executive-template-grid">{templates.map((template) => <article key={template.slug}><strong>{locale === "ar" ? template.name_ar : template.name_en}</strong><small>{template.slug} · {template.status} · {locale === "ar" ? "متاجر نشطة" : "Active stores"}: {template.active_store_count}</small><a href={`/s/${template.slug}`} target="_blank">{locale === "ar" ? "معاينة" : "Preview"}</a><button onClick={() => void toggle(template)} type="button">{locale === "ar" ? (template.status === "live" ? "تعطيل القالب" : "تفعيل القالب") : (template.status === "live" ? "Disable template" : "Enable template")}</button></article>)}</div>;
}

function SheetsSettings({ locale, onTest }: { locale: MockLocale; onTest: () => void }) {
  const ar = locale === "ar";
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/manager/integrations/google-sheets", { cache: "no-store" }).then((r) => r.json()).then((v) => { setUrl(v.url ?? ""); setEnabled(Boolean(v.enabled)); }).catch(() => undefined); }, []);
  async function save() {
    setError("");
    const response = await fetch("/api/manager/integrations/google-sheets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, enabled }) });
    const result = await response.json();
    if (!response.ok) { setError(result.message ?? "Save failed"); return; }
    setSaved(true);
  }
  return <div className="executive-sheet-settings"><label>{ar ? "رابط Webhook" : "Webhook URL"}<input autoComplete="off" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://script.google.com/macros/s/.../exec" /></label><label className="executive-toggle"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />{ar ? "مزامنة تلقائية" : "Enable automatic sync"}</label>{error && <p role="alert">{error}</p>}{saved && <p role="status">{ar ? "حُفظت الإعدادات." : "Settings saved."}</p>}<button onClick={() => void save()} type="button">{ar ? "حفظ" : "Save"}</button><button onClick={onTest} type="button">{ar ? "إرسال صف تجريبي" : "Send test row"}</button></div>;
}
