"use client";

import { useState } from "react";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useNotifications } from "./useNotifications";

export function NotificationCenter({ locale }: { locale: MockLocale }) {
  const { items, unreadCount, error, markAllRead } = useNotifications(locale);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const isArabic = locale === "ar";
  const visibleItems = filter === "unread"
    ? items.filter(({ read }) => !read)
    : items;

  return (
    <section className="notification-page-panel" dir={isArabic ? "rtl" : "ltr"}>
      <div className="notification-page-heading">
        <div className="notification-brand-heading">
          <BrandLogo size={36} variant="mark" />
          <h1>{isArabic ? "مركز الإشعارات" : "Notifications"}</h1>
        </div>
        <button className="button-link secondary" disabled={unreadCount === 0} onClick={() => void markAllRead()} type="button">
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
          <li className={item.read ? "is-read" : "is-unread"} key={item.id}>
            <span className="notification-unread-mark"><BrandLogo size={18} variant="mark" /></span>
            <div><strong>{item.title}</strong><p>{item.body}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
