"use client";

import Link from "next/link";
import { Moon, Sun, UserRound } from "lucide-react";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { AuthUser } from "@/lib/auth";
import type { MockLocale } from "@/mock/types";
import { useTheme } from "./ThemeProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
  const { theme, toggleTheme } = useTheme();
  const accountLabel = locale === "ar" ? "الحساب" : "Account";

  return (
    <div className={`platform-utilities${compact ? " platform-utilities-compact" : ""}`}>
      <button
        aria-label={theme === "dark"
          ? locale === "ar" ? "تفعيل الوضع الفاتح" : "Switch to light mode"
          : locale === "ar" ? "تفعيل الوضع الداكن" : "Switch to dark mode"}
        className="utility-icon-button"
        onClick={toggleTheme}
        type="button"
      >
        {theme === "dark" ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
      </button>
      <NotificationBell locale={locale} />
      <div aria-label={locale === "ar" ? "اللغة" : "Language"} className="utility-language-switch">
        <Link aria-current={locale === "ar" ? "page" : undefined} href={createLocaleHref(currentPath, query, "ar")}>عربي</Link>
        <span aria-hidden="true">/</span>
        <Link aria-current={locale === "en" ? "page" : undefined} href={createLocaleHref(currentPath, query, "en")}>EN</Link>
      </div>
      <Link aria-label={accountLabel} className="utility-icon-button" href={profileHref}>
        <UserRound aria-hidden="true" size={19} />
      </Link>
      <span className="visually-hidden">{user?.name ?? accountLabel}</span>
    </div>
  );
}
