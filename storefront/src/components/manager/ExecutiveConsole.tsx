"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Activity, ArrowDownLeft, ArrowDownRight, ArrowUpRight, ChevronLeft, ExternalLink, LayoutDashboard, LockKeyhole, Search, ShieldCheck, Store as StoreIcon, Users, WandSparkles } from "lucide-react";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { WorldQuickSwitcher } from "@/components/platform/WorldQuickSwitcher";

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
type Tab = "overview" | "studio" | "stores" | "catalog" | "integrations";

const tabs: Array<{ id: Tab; ar: string; en: string }> = [
  { id: "overview", ar: "نظرة عامة", en: "Overview" },
  { id: "studio", ar: "استوديو المتاجر", en: "Store studio" },
  { id: "stores", ar: "المتاجر والتجار", en: "Stores & merchants" },
  { id: "catalog", ar: "القوالب والباقات", en: "Templates & plans" },
  { id: "integrations", ar: "الربط السحابي والأمان", en: "Cloud & security" },
];

const tabIcons = { overview: LayoutDashboard, studio: WandSparkles, stores: StoreIcon, catalog: Activity, integrations: ShieldCheck };

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

function relativeTime(value: string, locale: MockLocale): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  const unit: Intl.RelativeTimeFormatUnit = minutes < 60 ? "minute" : minutes < 1440 ? "hour" : "day";
  const amount = unit === "minute" ? minutes : unit === "hour" ? Math.floor(minutes / 60) : Math.floor(minutes / 1440);
  return new Intl.RelativeTimeFormat(locale === "ar" ? "ar-EG" : "en", { numeric: "auto" }).format(-amount, unit);
}

export function ExecutiveConsole({ locale, ownerName = "", user }: { locale: MockLocale; ownerName?: string; user: AuthUser }) {
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
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showOnline, setShowOnline] = useState(false);
  const [drawerStore, setDrawerStore] = useState<Store | null>(null);
  const [storeFilter, setStoreFilter] = useState<"all" | "active" | "pending" | "suspended">("all");
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
  const visibleStores = stores.filter((store) => storeFilter === "all" || (storeFilter === "pending" ? store.status === "pending" || store.build_completion < 100 : store.status === storeFilter));
  const chartPoints = useMemo(() => {
    const byDay = new Map<string, number>();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - chartDays + 1);
    for (const item of metric?.series ?? []) {
      if (item.event_type !== chartMode || new Date(`${item.day}T00:00:00`) < cutoff) continue;
      byDay.set(item.day, (byDay.get(item.day) ?? 0) + item.total);
    }
    const values = [...byDay.values()].slice(-chartDays);
    if (values.length < 2) return "M 0 68 C 25 68, 75 68, 100 68";
    const max = Math.max(...values, 1);
    const points = values.map((value, index) => ({ x: (index / (values.length - 1)) * 100, y: 72 - (value / max) * 58 }));
    return points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = points[index - 1];
      const midpoint = (previous.x + point.x) / 2;
      return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
    }, "");
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
    <section className="executive-shell" dir={ar ? "rtl" : "ltr"}>
      <header className="executive-topbar">
        <div className="executive-brand"><Link href="/" aria-label="CommerceForge"><BrandLogo size={36} showArabicSubtitle={false} /></Link><span className="executive-console-tag">Executive Console</span></div>
        <label className="executive-search"><Search size={17} aria-hidden="true" /><input aria-label={ar ? "بحث سريع" : "Global search"} onChange={(event) => setSearch(event.target.value)} placeholder={ar ? "ابحث عن متجر أو تاجر" : "Search stores or merchants"} value={search} /><kbd>⌘ K</kbd></label>
        <div className="executive-top-actions"><button className="executive-back-button" type="button" onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")} aria-label={ar ? "رجوع" : "Back"}><ArrowDownLeft size={16} />{ar ? "رجوع" : "Back"}</button><WorldQuickSwitcher locale={locale} user={user} />
          <div className="executive-online-anchor"><button className="executive-online-pill" aria-expanded={showOnline} onClick={() => setShowOnline((value) => !value)} type="button"><span className="executive-live-dot" />{ar ? `متواجدون الآن ${metric?.online_total ?? "—"}` : `Online now ${metric?.online_total ?? "—"}`}</button>{showOnline && <div className="executive-popover"><strong>{ar ? "المتواجدون حسب المساحة" : "Presence by workspace"}</strong><span>{ar ? "التسويق" : "Marketing"}<b>{metric?.online_by_zone.marketing ?? 0}</b></span><span>{ar ? "لوحة التاجر" : "Merchant dashboard"}<b>{metric?.online_by_zone.merchant_dashboard ?? 0}</b></span><span>{ar ? "المتاجر" : "Storefronts"}<b>{metric?.online_by_zone.storefront ?? 0}</b></span></div>}</div>
          <NotificationBell locale={locale} buttonClassName="executive-icon-button" />
          <span className="executive-avatar" aria-label={ownerName}>{ownerName.trim().charAt(0).toUpperCase() || "C"}</span>
          <LogoutButton label={ar ? "تسجيل الخروج" : "Sign out"} locale={locale} />
        </div>
      </header>
      <div className="executive-layout">
        <aside className="executive-sidebar">
          <div className="executive-sidebar-label">{ar ? "مساحة العمل" : "WORKSPACE"}</div>
          <nav className="executive-rail" aria-label={ar ? "أقسام غرفة القيادة" : "Executive modules"}>
            {tabs.map((item) => { const Icon = tabIcons[item.id]; return <button aria-current={tab === item.id ? "page" : undefined} key={item.id} onClick={() => setTab(item.id)} type="button"><Icon size={18} aria-hidden="true" /><span>{ar ? item.ar : item.en}</span>{tab === item.id && <ChevronLeft size={15} aria-hidden="true" />}</button>; })}
          </nav>
          <div className="executive-workspace-card"><span>{ar ? "التنقل السريع" : "QUICK ACCESS"}</span><Link href="/dashboard">{ar ? "لوحة التاجر" : "Merchant workspace"}<ExternalLink size={14} /></Link><Link href="/s/demo">{ar ? "المتجر التجريبي" : "Demo storefront"}<ExternalLink size={14} /></Link></div>
          <div className="executive-sidebar-foot"><LockKeyhole size={15} /><span>{ar ? "وصول المالك محمي" : "Owner access protected"}</span></div>
        </aside>
        <main className="executive-content">
          <div className="executive-mobile-search"><Search size={17} /><input aria-label={ar ? "بحث سريع" : "Global search"} onChange={(event) => setSearch(event.target.value)} placeholder={ar ? "ابحث عن متجر أو تاجر" : "Search stores or merchants"} value={search} /></div>
          {error && <p className="executive-error" role="alert">{error}</p>}
          {toast && <p className="executive-toast" role="status" onAnimationEnd={() => setToast("")}>{toast}</p>}

      {tab === "overview" && <>
        <div className="executive-welcome"><div><span className="executive-eyebrow">{ar ? "مركز قيادة CommerceForge" : "COMMERCEFORGE COMMAND CENTER"}</span><h1>{ar ? "أهلاً بك في غرفة القيادة" : "Welcome to your command center"}</h1><p>{new Intl.DateTimeFormat(ar ? "ar-EG" : "en-US", { dateStyle: "full" }).format(new Date())} <span>·</span> {ar ? "إليك نبض المنصة في لمحة" : "Your platform at a glance"}</p></div><button className="executive-primary" onClick={() => { setTab("studio"); setSelectedSlug(stores.find((store) => store.build_completion < 100)?.slug ?? ""); }} type="button">{ar ? "مراجعة المتاجر المعلّقة" : "Review pending stores"}<ArrowDownRight size={17} /></button></div>
        <div className="executive-kpis">
          <article><div className="executive-kpi-top"><span>{ar ? "المتواجدون الآن" : "Online now"}</span><span className="executive-kpi-icon green"><Users size={18} /></span></div><strong>{metric?.online_total ?? "—"}</strong><small className="executive-trend positive"><ArrowUpRight size={14} />{ar ? `تسويق ${metric?.online_by_zone.marketing ?? 0} · تجار ${metric?.online_by_zone.merchant_dashboard ?? 0}` : `${metric?.online_by_zone.marketing ?? 0} marketing · ${metric?.online_by_zone.merchant_dashboard ?? 0} merchants`}</small></article>
          <article><div className="executive-kpi-top"><span>{ar ? "إجمالي المتاجر" : "Total stores"}</span><span className="executive-kpi-icon"><StoreIcon size={18} /></span></div><strong>{metric?.stores_total ?? "—"}</strong><small className="executive-trend positive"><ArrowUpRight size={14} />{ar ? "المتاجر المسجلة بالمنصة" : "Stores registered on platform"}</small></article>
          <article><div className="executive-kpi-top"><span>{ar ? "بانتظار المراجعة" : "Awaiting review"}</span><span className="executive-kpi-icon amber"><Activity size={18} /></span></div><strong>{metric?.stores_pending_review ?? "—"}</strong><small className="executive-trend pending">{ar ? "أولوية المراجعة" : "Review priority"}</small></article>
          <article><div className="executive-kpi-top"><span>{ar ? "إجمالي المبيعات GMV" : "Platform GMV"}</span><span className="executive-kpi-icon"><ArrowUpRight size={18} /></span></div><strong>{metric ? metric.gmv.toLocaleString() : "—"}<small className="executive-currency">{ar ? "ج.م" : "EGP"}</small></strong><small className="executive-trend">{ar ? `من ${metric?.orders_total ?? 0} طلب` : `${metric?.orders_total ?? 0} orders`}</small></article>
        </div>
        <div className="executive-columns">
          <article className="executive-panel executive-analytics"><header className="executive-panel-heading"><div><span className="executive-eyebrow">{ar ? "مؤشرات المنصة" : "PLATFORM INSIGHTS"}</span><h2>{ar ? "النمو ونشاط المنصة" : "Platform activity"}</h2></div><select aria-label={ar ? "مقياس المخطط" : "Chart metric"} onChange={(event) => setChartMode(event.target.value as typeof chartMode)} value={chartMode}><option value="new_signup">{ar ? "التسجيلات" : "Signups"}</option><option value="stores">{ar ? "المتاجر" : "Stores"}</option><option value="gmv">GMV</option></select></header><div className="executive-chart-controls"><div><button onClick={() => setChartDays(7)} aria-pressed={chartDays === 7} type="button">{ar ? "7 أيام" : "7 days"}</button><button onClick={() => setChartDays(30)} aria-pressed={chartDays === 30} type="button">{ar ? "30 يومًا" : "30 days"}</button></div><span>{ar ? "مقارنة بالفترة السابقة" : "Compared with previous period"} <ArrowUpRight size={14} /></span></div><svg className="executive-chart" viewBox="0 0 100 80" preserveAspectRatio="none" role="img" aria-label={ar ? "مخطط حقيقي من قاعدة البيانات" : "Live database chart"}><defs><linearGradient id="executive-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="rgba(245,158,11,0.28)" /><stop offset="100%" stopColor="rgba(245,158,11,0)" /></linearGradient></defs><path d={`${chartPoints} L 100 80 L 0 80 Z`} fill="url(#executive-chart-fill)"/><path d={chartPoints} fill="none" stroke="#F6B94B" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg><div className="executive-chart-labels"><span>{ar ? "بداية الفترة" : "Period start"}</span><span>{ar ? "اليوم" : "Today"}</span></div></article>
          <article className="executive-panel executive-activity"><header className="executive-panel-heading"><div><span className="executive-eyebrow">{ar ? "مباشر" : "LIVE"}</span><h2>{ar ? "آخر نشاط" : "Recent activity"}</h2></div><span className="executive-live-dot" /></header><div className="executive-events">{events.slice(-7).reverse().map((event) => <div key={event.id}><span className="executive-event-avatar">{(labels[event.type]?.[locale] ?? event.type).charAt(0)}</span><div><b>{labels[event.type]?.[locale] ?? event.type}</b><span>{event.subject ?? event.store_slug ?? "—"}</span></div><time>{relativeTime(event.created_at, locale)}</time></div>)}{events.length === 0 && <p>{ar ? "لا توجد أحداث مسجلة بعد." : "No events have been recorded yet."}</p>}</div></article>
        </div>
      </>}

      {tab === "studio" && <>
        <div className="executive-view-heading"><div><span className="executive-eyebrow">{ar ? "مراجعة وإبداع" : "REVIEW & CREATE"}</span><h1>{ar ? "استوديو المتاجر المرئي" : "Visual store studio"}</h1><p>{ar ? "عدّل واجهة المتجر وشاهد التغييرات مباشرة." : "Refine the storefront and preview changes instantly."}</p></div><span className="executive-soft-pill amber">{metric?.stores_pending_review ?? 0} {ar ? "بانتظار المراجعة" : "awaiting review"}</span></div>
        <div className="executive-studio">
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
        <div className={"executive-preview-wrap " + (previewDevice === "mobile" ? "is-mobile" : "")}><div className="executive-browser-toolbar"><span className="executive-browser-dots"><i /><i /><i /></span><span className="executive-browser-address">{selectedStore ? selectedStore.slug + ".commerceforge.store" : "preview.commerceforge.store"}</span><div className="executive-device-switch"><button type="button" aria-pressed={previewDevice === "desktop"} onClick={() => setPreviewDevice("desktop")}>{ar ? "سطح المكتب" : "Desktop"} · 1280</button><button type="button" aria-pressed={previewDevice === "mobile"} onClick={() => setPreviewDevice("mobile")}>{ar ? "الهاتف" : "Mobile"} · 375</button></div></div><div className="executive-preview executive-panel">{selectedStore ? <iframe onLoad={preview} title={ar ? `معاينة ${selectedStore.store_name}` : `Preview ${selectedStore.store_name}`} src={`/s/${encodeURIComponent(selectedStore.slug)}?lang=${previewLocale}&manager_preview=1`} /> : <p>{ar ? "اختر متجرًا لفتح المعاينة التفاعلية." : "Choose a store to open its interactive preview."}</p>}</div>
      </div></div></>}

      {tab === "stores" && <section className="executive-panel executive-directory"><header className="executive-panel-heading"><div><span className="executive-eyebrow">{ar ? "دليل المنصة" : "PLATFORM DIRECTORY"}</span><h1>{ar ? "المتاجر والتجار" : "Stores & merchants"}</h1></div><span className="executive-soft-pill">{stores.length} {ar ? "متجر" : "stores"}</span></header><div className="executive-filter-tabs">{(["all", "active", "pending", "suspended"] as const).map((filter) => <button type="button" key={filter} aria-pressed={storeFilter === filter} onClick={() => setStoreFilter(filter)}>{filter === "all" ? (ar ? "الكل" : "All") : filter === "active" ? (ar ? "منشور" : "Published") : filter === "pending" ? (ar ? "قيد المراجعة" : "In review") : (ar ? "موقوف" : "Suspended")}</button>)}</div><div className="executive-table-scroll"><table className="executive-table"><thead><tr><th>{ar ? "المتجر" : "Store"}</th><th>{ar ? "التاجر" : "Merchant"}</th><th>{ar ? "الباقة" : "Plan"}</th><th>{ar ? "الحالة" : "Status"}</th><th>{ar ? "الإجراءات" : "Actions"}</th></tr></thead><tbody>{visibleStores.map((store) => <tr key={store.slug}><td><div className="executive-store-cell"><span className="executive-store-monogram">{store.store_name.charAt(0)}</span><div><strong>{store.store_name}</strong><small>{store.slug} · {store.template_slug}</small></div></div></td><td><strong>{store.owner_name ?? "—"}</strong><small>{store.owner_email ?? "—"}</small></td><td><span className="executive-soft-pill">{store.plan}</span></td><td><span className={"executive-soft-pill " + (store.status === "active" ? "green" : store.status === "suspended" ? "red" : "amber")}>{store.status}</span></td><td><button className="executive-secondary" type="button" onClick={() => { setSelectedSlug(store.slug); setTab("studio"); }}>{ar ? "الاستوديو" : "Studio"}</button><button className="executive-secondary" type="button" onClick={() => setDrawerStore(store)}>{ar ? "التفاصيل" : "Details"}</button></td></tr>)}</tbody></table></div></section>}
      {tab === "catalog" && <><section className="executive-panel"><header className="executive-panel-heading"><div><span className="executive-eyebrow">{ar ? "مكتبة التصميم" : "DESIGN LIBRARY"}</span><h1>{ar ? "قوالب المتاجر" : "Store templates"}</h1></div></header><TemplateCatalog locale={locale} /></section><section className="executive-plan-section"><header className="executive-panel-heading"><div><span className="executive-eyebrow">{ar ? "الاشتراكات" : "SUBSCRIPTIONS"}</span><h2>{ar ? "الخطط الحالية" : "Current plans"}</h2></div></header><div className="executive-plan-grid">{[{name:"Free", count:metric?.plans.free ?? 0, color:"slate"},{name:"Pro", count:metric?.plans.paid ?? 0, color:"gold"},{name:"Enterprise", count:0, color:"violet"}].map((plan) => <article className={"executive-plan-card " + plan.color} key={plan.name}><span>{plan.name}</span><strong>{plan.count}</strong><small>{ar ? "اشتراك حالي" : "subscribers"}</small><p>{ar ? "باقة CommerceForge" : "CommerceForge plan"}</p><button className="executive-secondary" type="button" onClick={() => setToast(ar ? "تعديل الأسعار يتطلب ربط نظام فوترة." : "Plan edits require a billing integration.")}>{ar ? "تفاصيل الباقة" : "Plan details"}</button></article>)}</div><p className="executive-muted-note">{ar ? "لا يوجد موصل فوترة؛ لا نعرض إيراداً تقديرياً." : "No billing provider is connected; estimated revenue is not shown."}</p></section></>}
      {tab === "integrations" && <><div className="executive-integration-grid"><section className="executive-panel"><header className="executive-panel-heading"><div><span className="executive-eyebrow">LIVE SYNC</span><h1>Google Sheets</h1></div></header><p>{ar ? "اربط أحداث المنصة بورقة Google Sheets عبر Webhook." : "Connect platform events to Google Sheets with a webhook."}</p><SheetsSettings locale={locale} onTest={() => void sendTestSync()} /><div className="executive-actions"><button onClick={() => void csv("stores")} type="button">{ar ? "تصدير المتاجر CSV" : "Export stores CSV"}</button><button onClick={() => void csv("events")} type="button">{ar ? "تصدير الأحداث CSV" : "Export events CSV"}</button><button onClick={() => void csv("orders")} type="button">{ar ? "تصدير الطلبات CSV" : "Export orders CSV"}</button></div></section><section className="executive-panel executive-security-card"><span className={"executive-soft-pill " + (metric?.manager_lock_ready ? "green" : "amber")}>{metric?.manager_lock_ready ? (ar ? "نشط ومحمي" : "Active & protected") : (ar ? "مغلق بأمان" : "Fail-closed")}</span><strong className="executive-security-count">{metric?.google_allowlist_count ?? 0}<i>/ 2</i></strong><h2>{ar ? "قفل حسابَي المالك" : "Two-account owner lock"}</h2><p>{ar ? "الوصول مقتصر على حسابَي Google المحددين على الخادم." : "Access is restricted to two server-configured Google accounts."}</p><ShieldCheck size={32} /></section></div><section className="executive-panel"><header className="executive-panel-heading"><h2>{ar ? "سجل الأمان والتدقيق" : "Security & audit log"}</h2><button className="executive-secondary" onClick={() => void refresh()} type="button">{ar ? "تحديث السجل" : "Refresh"}</button></header><div className="executive-table-scroll"><table className="executive-table"><thead><tr><th>{ar ? "الحدث" : "Event"}</th><th>{ar ? "الخطورة" : "Severity"}</th><th>IP</th><th>{ar ? "المعرّف" : "Identifier"}</th><th>{ar ? "الوقت" : "Timestamp"}</th></tr></thead><tbody>{securityLogs.map((log) => <tr key={log.id}><td>{log.event}</td><td><span className="executive-soft-pill amber">{log.severity}</span></td><td>{log.ip_address ?? "—"}</td><td>{log.identifier_hash?.slice(0, 12) ?? "—"}</td><td>{new Date(log.created_at).toLocaleString(ar ? "ar-EG" : "en-US")}</td></tr>)}</tbody></table>{securityLogs.length === 0 && <p className="executive-empty-state">{ar ? "لا توجد أحداث أمنية مسجلة." : "No security events recorded."}</p>}</div></section></>}
      {drawerStore && <div className="executive-drawer-backdrop" onClick={() => setDrawerStore(null)}><aside className="executive-drawer" onClick={(event) => event.stopPropagation()}><button className="executive-drawer-close" onClick={() => setDrawerStore(null)} type="button" aria-label={ar ? "إغلاق" : "Close"}>×</button><span className="executive-eyebrow">{ar ? "ملف المتجر" : "STORE PROFILE"}</span><h2>{drawerStore.store_name}</h2><p>{drawerStore.owner_name} · {drawerStore.owner_email}</p><p>{ar ? "القالب" : "Template"}: {drawerStore.template_slug} · {ar ? "الباقة" : "Plan"}: {drawerStore.plan}</p><button className="executive-primary" onClick={() => { setSelectedSlug(drawerStore.slug); setTab("studio"); setDrawerStore(null); }} type="button">{ar ? "فتح الاستوديو" : "Open studio"}</button><button className="executive-danger-link" onClick={() => { void setStoreStatus(drawerStore); setDrawerStore(null); }} type="button">{drawerStore.status === "suspended" ? (ar ? "تفعيل المتجر" : "Reactivate store") : (ar ? "إيقاف المتجر" : "Suspend store")}</button></aside></div>}
        </main>
      </div>    </section>
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
