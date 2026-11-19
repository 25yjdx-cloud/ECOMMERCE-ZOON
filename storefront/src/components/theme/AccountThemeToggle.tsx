"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function AccountThemeToggle({ locale }: { locale: "ar" | "en" }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark"
    ? locale === "ar" ? "تفعيل الوضع الفاتح" : "Switch to light mode"
    : locale === "ar" ? "تفعيل الوضع الداكن" : "Switch to dark mode";

  return (
    <button aria-label={label} className="account-theme-toggle" onClick={toggleTheme} type="button">
      {theme === "dark" ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
      <span>{label}</span>
    </button>
  );
}
