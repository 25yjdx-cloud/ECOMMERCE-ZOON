"use client";

import Link from "next/link";
import { Bell, Moon, Sun, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { AuthUser } from "@/lib/auth";
import type { MockLocale } from "@/mock/types";
import { useTheme } from "./ThemeProvider";

type Notification = { id: string; title: string; body: string; created_at: string };

const notificationCopy = {
  ar: {
    open: "مركز الإشعارات",
    markAll: "تحديد الكل كمقروء",
    empty: "لا توجد إشعارات جديدة.",
    error: "تعذر تحميل الإشعارات حالياً.",
    all: "عرض كل الإشعارات",
    account: "الحساب",
    light: "تفعيل الوضع الفاتح",
    dark: "تفعيل الوضع الداكن",
  },
  en: {
    open: "Notifications",
    markAll: "Mark all as read",
    empty: "No new notifications.",
    error: "Notifications are unavailable right now.",
    all: "View all notifications",
    account: "Account",
    light: "Switch to light mode",
    dark: "Switch to dark mode",
  },
} satisfies Record<MockLocale, Record<string, string>>;

function readReadIds(): Set<string> {
  try {
    const value = window.localStorage.getItem("commerceforge-read-notifications");
    const parsed: unknown = value ? JSON.parse(value) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return new Set();
  }
}

export function PlatformUtilities({
  locale,
  user,
  profileHref,
  currentPath,
  query = {},
  compact = false,
}: {
  locale: MockLocale;
  user: AuthUser | null;
  profileHref: string;
  currentPath: string;
  query?: QueryValues;
  compact?: boolean;
}) {
  const text = notificationCopy[locale];
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState(false);
  const unreadCount = notifications.filter(({ id }) => !readIds.has(id)).length;

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?lang=${locale}`, { cache: "no-store" });
      if (!response.ok) {
        setLoadError(true);
        return;
      }
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data)) {
        setLoadError(true);
        return;
      }
      setNotifications(payload.data as Notification[]);
      setLoadError(false);
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      setLoadError(true);
    }
  }, [locale]);

  useEffect(() => {
    setReadIds(readReadIds());
    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 60_000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  function markAllRead() {
    const next = new Set(notifications.map(({ id }) => id));
    setReadIds(next);
    window.localStorage.setItem("commerceforge-read-notifications", JSON.stringify([...next]));
  }

  return (
    <div className={`platform-utilities${compact ? " platform-utilities-compact" : ""}`}>
      <button
        aria-label={theme === "dark" ? text.light : text.dark}
        className="utility-icon-button"
        onClick={toggleTheme}
        type="button"
      >
        {theme === "dark" ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
      </button>
      <div className="notification-anchor">
        <button
          aria-expanded={open}
          aria-label={text.open}
          className="utility-icon-button"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Bell aria-hidden="true" size={19} />
          {unreadCount > 0 && <span aria-label={`${unreadCount}`} className="notification-dot" />}
        </button>
        {open && (
          <section aria-label={text.open} className="notification-popover" dir={locale === "ar" ? "rtl" : "ltr"}>
            <header>
              <strong>{text.open}</strong>
              {unreadCount > 0 && <button className="text-button" onClick={markAllRead} type="button">{text.markAll}</button>}
            </header>
            {loadError ? (
              <p role="status">{text.error}</p>
            ) : notifications.length === 0 ? (
              <p>{text.empty}</p>
            ) : (
              <ul>
                {notifications.slice(0, 5).map((notification) => (
                  <li className={readIds.has(notification.id) ? "is-read" : "is-unread"} key={notification.id}>
                    <strong>{notification.title}</strong>
                    <span>{notification.body}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/notifications?lang=${locale}`} onClick={() => setOpen(false)}>{text.all}</Link>
          </section>
        )}
      </div>
      <div aria-label={locale === "ar" ? "اللغة" : "Language"} className="utility-language-switch">
        <Link aria-current={locale === "ar" ? "page" : undefined} href={createLocaleHref(currentPath, query, "ar")}>عربي</Link>
        <span aria-hidden="true">/</span>
        <Link aria-current={locale === "en" ? "page" : undefined} href={createLocaleHref(currentPath, query, "en")}>EN</Link>
      </div>
      <Link aria-label={text.account} className="utility-icon-button" href={profileHref}>
        <UserRound aria-hidden="true" size={19} />
      </Link>
      <span className="visually-hidden">{user?.name ?? text.account}</span>
    </div>
  );
}
