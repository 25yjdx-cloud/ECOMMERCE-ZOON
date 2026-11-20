"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState } from "react";
import type { MockLocale } from "@/mock/types";
import { useNotifications } from "./useNotifications";

export function NotificationBell({
  locale,
  buttonClassName = "utility-icon-button",
}: {
  locale: MockLocale;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, error, markRead, markAllRead } = useNotifications(locale);
  const isArabic = locale === "ar";
  const label = isArabic ? "مركز الإشعارات" : "Notifications";
  const isNavbar = buttonClassName.includes("navbar-notifications");

  return (
    <div className="notification-anchor">
      <button
        aria-expanded={open}
        aria-label={`${label}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        className={buttonClassName}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Bell aria-hidden="true" size={19} />
        {unreadCount > 0 && (
          <span className={isNavbar ? "navbar-unread-count" : "notification-count-badge"}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <section aria-label={label} className="notification-popover" dir={isArabic ? "rtl" : "ltr"}>
          <header>
            <strong>{label}</strong>
            {unreadCount > 0 && (
              <button className="text-button" onClick={() => void markAllRead()} type="button">
                {isArabic ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            )}
          </header>
          {error ? (
            <p role="status">{isArabic ? "تعذر تحميل الإشعارات حالياً." : "Notifications are unavailable right now."}</p>
          ) : items.length === 0 ? (
            <p>{isArabic ? "لا توجد إشعارات جديدة." : "No new notifications."}</p>
          ) : (
            <ul>
              {items.slice(0, 5).map((item) => (
                <li className={item.read ? "is-read" : "is-unread"} key={item.id}>
                  <button className="notification-item-button" onClick={() => void markRead(item.id)} type="button">
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/notifications?lang=${locale}`} onClick={() => setOpen(false)}>
            {isArabic ? "عرض كل الإشعارات" : "View all notifications"}
          </Link>
        </section>
      )}
    </div>
  );
}
