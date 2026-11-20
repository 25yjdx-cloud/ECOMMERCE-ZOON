"use client";

import { useCallback, useState } from "react";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";

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

export function DeveloperRefinementQueue({
  locale,
  initialStores,
  initialSummary,
}: {
  locale: MockLocale;
  initialStores: RefinementStore[];
  initialSummary: PlatformSummary;
}) {
  const [stores, setStores] = useState<RefinementStore[]>(initialStores);
  const [summary, setSummary] = useState<PlatformSummary>(initialSummary);
  const [error, setError] = useState("");
  const [pendingSlug, setPendingSlug] = useState("");
  const ar = locale === "ar";

  const load = useCallback(async () => {
    const response = await fetch("/api/manager/refinement-queue", { cache: "no-store" });
    const payload: unknown = await response.json();
    if (!response.ok) {
      const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Unable to load the refinement queue.";
      throw new Error(message);
    }

    if (
      !payload
      || typeof payload !== "object"
      || !("data" in payload)
      || !Array.isArray(payload.data)
      || !("summary" in payload)
      || !payload.summary
      || typeof payload.summary !== "object"
    ) {
      throw new Error("The refinement queue response is invalid.");
    }
    setStores(payload.data as RefinementStore[]);
    setSummary(payload.summary as PlatformSummary);
  }, []);

  async function refresh() {
    setError("");
    try {
      await load();
    } catch (loadError) {
      if (loadError instanceof Error) setError(loadError.message);
      else throw loadError;
    }
  }

  async function setStatus(slug: string, status: "in_progress" | "delivered") {
    setPendingSlug(slug);
    setError("");
    try {
      const response = await fetch(`/api/manager/refinement-queue?slug=${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : "Unable to update delivery status.";
        throw new Error(message);
      }
      await load();
    } catch (requestError) {
      if (requestError instanceof Error) setError(requestError.message);
      else throw requestError;
    } finally {
      setPendingSlug("");
    }
  }

  return (
    <>
      {summary && (
        <section className="manager-kpi-grid" aria-label={ar ? "مؤشرات المنصة" : "Platform KPIs"}>
          <article className="manager-branded-kpi"><BrandLogo className="manager-kpi-watermark" size={74} variant="watermark" /><span>{ar ? "إجمالي العملاء" : "Total clients"}</span><strong>{summary.client_count}</strong></article>
          <article><span>{ar ? "متاجر استضافة المنصة" : "Platform-hosted stores"}</span><strong>{summary.active_saas_stores}</strong></article>
          <article><span>{ar ? "طلبات المراجعة المعلقة" : "Pending refinements"}</span><strong>{summary.pending_refinement_count}</strong></article>
          <article><span>{ar ? "إيرادات الاشتراكات الشهرية" : "Monthly subscription revenue"}</span><strong>{summary.monthly_subscription_revenue === null ? (ar ? "غير متصل" : "Not connected") : summary.monthly_subscription_revenue}</strong></article>
        </section>
      )}
      <section className="manager-queue" aria-labelledby="refinement-queue-title">
        <div className="manager-queue-heading">
          <h2 id="refinement-queue-title">{ar ? "طلبات تأكيد وتظبيط المطور" : "Developer refinement queue"}</h2>
          <button className="text-button" onClick={() => void refresh()} type="button">{ar ? "تحديث" : "Refresh"}</button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {stores.length === 0 ? (
          <p>{ar ? "لا توجد متاجر بانتظار المراجعة حالياً." : "No stores are waiting for review."}</p>
        ) : stores.map((store) => (
          <article className="manager-queue-row" key={store.slug}>
            <div>
              <BrandLogo size={28} variant="mark" />
              <strong>{store.store_name}</strong>
              <span>{store.slug} · {store.template_slug}</span>
              <span>{store.hosting_mode === "saas" ? (ar ? "استضافة المنصة" : "Platform hosting") : (ar ? "استضافة العميل" : "Client hosting")}</span>
              {store.domain && <span dir="ltr">{store.domain}</span>}
              <progress max={100} value={store.build_completion}>{store.build_completion}%</progress>
            </div>
            <div className="manager-template-actions">
              <button disabled={pendingSlug === store.slug || store.status === "in_progress"} onClick={() => void setStatus(store.slug, "in_progress")} type="button">
                {ar ? "بدء المراجعة" : "Start review"}
              </button>
              <button disabled={pendingSlug === store.slug} onClick={() => void setStatus(store.slug, "delivered")} type="button">
                {ar ? "تم التأكيد والتسليم النهائي" : "Confirm final delivery"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
