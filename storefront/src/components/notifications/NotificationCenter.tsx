"use client";

import { useEffect, useState } from "react";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Notification = { id: string; title: string; body: string; created_at: string };

export function NotificationCenter({ locale }: { locale: MockLocale }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const isArabic = locale === "ar";
  const visibleItems = filter === "unread"
    ? items.filter(({ id }) => !readIds.includes(id))
    : items;

  useEffect(() => {
    const saved = window.localStorage.getItem("commerceforge-read-notifications");
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setReadIds(parsed.filter((value): value is string => typeof value === "string"));
      } catch (parseError) {
        if (!(parseError instanceof SyntaxError)) throw parseError;
        window.localStorage.removeItem("commerceforge-read-notifications");
      }
    }

    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/notifications?lang=${locale}`, { cache: "no-store" });
        if (!response.ok) {
          if (active) setError(true);
          return;
        }
        const payload: unknown = await response.json();
        if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)) {
          if (active) {
            setItems(payload.data as Notification[]);
            setError(false);
          }
        } else if (active) {
          setError(true);
        }
      } catch (requestError) {
        if (!(requestError instanceof TypeError)) throw requestError;
        if (active) setError(true);
      }
    };

    void load();
    const interval = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [locale]);

  function markAllRead() {
    const next = items.map(({ id }) => id);
    setReadIds(next);
    window.localStorage.setItem("commerceforge-read-notifications", JSON.stringify(next));
  }

  return (
    <section className="notification-page-panel" dir={isArabic ? "rtl" : "ltr"}>
      <div className="notification-page-heading">
        <div className="notification-brand-heading">
          <BrandLogo size={36} variant="mark" />
          <h1>{isArabic ? "مركز الإشعارات" : "Notifications"}</h1>
        </div>
        <button className="button-link secondary" disabled={items.every(({ id }) => readIds.includes(id))} onClick={markAllRead} type="button">
          {isArabic ? "تحديد الكل كمقروء" : "Mark all as read"}
        </button>
      </div>
      <div aria-label={isArabic ? "تصفية الإشعارات" : "Filter notifications"} className="notification-filters">
        <button aria-pressed={filter === "all"} onClick={() => setFilter("all")} type="button">
          {isArabic ? "الكل" : "All"}
        </button>
        <button aria-pressed={filter === "unread"} onClick={() => setFilter("unread")} type="button">
          {isArabic ? "غير مقروء" : "Unread"}
        </button>
      </div>
      {error && <p className="auth-error" role="alert">{isArabic ? "تعذر تحميل الإشعارات حالياً." : "Notifications are unavailable right now."}</p>}
      {!error && visibleItems.length === 0 && (
        <p>{filter === "unread"
          ? isArabic ? "لا توجد إشعارات غير مقروءة." : "No unread notifications."
          : isArabic ? "لا توجد إشعارات." : "No notifications."}</p>
      )}
      <ul className="notification-page-list">
        {visibleItems.map((item) => (
          <li className={readIds.includes(item.id) ? "is-read" : "is-unread"} key={item.id}>
            <span className="notification-unread-mark"><BrandLogo size={18} variant="mark" /></span>
            <div><strong>{item.title}</strong><p>{item.body}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
