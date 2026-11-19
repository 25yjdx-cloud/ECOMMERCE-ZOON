"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Bell, CreditCard, House, Menu, MessageCircle, Moon, Store, Sun, UserRound, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useTheme } from "@/components/theme/ThemeProvider";

type LandingHeaderProps = {
  locale: MockLocale;
  dictionary: Dictionary;
  user: AuthUser | null;
  basePath?: string;
  query?: QueryValues;
};

export function LandingHeader({ locale, dictionary, user, basePath = "/", query = {} }: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const nav = dictionary.navigation;
  const withLocale = (path: string) => {
    const [pathname, hash] = path.split("#", 2);
    const separator = pathname.includes("?") ? "&" : "?";
    return `${pathname}${separator}lang=${locale}${hash ? `#${hash}` : ""}`;
  };
  const languageHref = (language: MockLocale) => createLocaleHref(basePath, query, language);
  const otherLocale: MockLocale = locale === "ar" ? "en" : "ar";
  const accountHref = user?.role === "super_admin"
    ? withLocale("/account")
    : user?.role === "merchant"
      ? withLocale("/account")
      : withLocale("/login");

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const homeHref = withLocale("/");
  const templatesHref = withLocale("/templates");
  const pricingHref = withLocale("/#pricing");
  const contactHref = withLocale("/#contact");
  const accountLabel = locale === "ar" ? "إعدادات الحساب" : "Account settings";
  const notificationsLabel = locale === "ar" ? "الإشعارات" : "Notifications";
  const storeLabel = user?.storeSlug
    ? locale === "ar" ? "لوحة متجري" : "My store"
    : locale === "ar" ? "أنشئ متجرك" : "Create your store";
  const menuLabel = locale === "ar" ? "القائمة الرئيسية" : "Main navigation";

  return (
    <>
    <header className="site-header landing-nav">
      <div className="navbar-inner">
      <Link className="brand-mark" href={homeHref} aria-label="CommerceForge">
        <span aria-hidden="true" className="brand-symbol">
          <svg fill="none" viewBox="0 0 32 32">
            <path d="M5 26V15.5C5 9.7 9.7 5 15.5 5h1C22.3 5 27 9.7 27 15.5V26" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
            <path d="M10 26V16a6 6 0 0 1 12 0v10M15 26V16a1 1 0 0 1 2 0v10" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </span>
        <span>CommerceForge</span>
      </Link>
      <nav aria-label={menuLabel} className="navbar-center-links">
        <Link href={homeHref}>{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        <Link href={templatesHref}>{nav.presets}</Link>
        <Link href={pricingHref}>{nav.pricing}</Link>
        <Link href={contactHref}>{nav.contact}</Link>
      </nav>
      <div className="navbar-controls">
        <button
          aria-label={theme === "dark"
            ? locale === "ar" ? "تفعيل الوضع الفاتح" : "Switch to light mode"
            : locale === "ar" ? "تفعيل الوضع الداكن" : "Switch to dark mode"}
          className="navbar-icon-button theme-toggle"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
        </button>
        <Link
          aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          className="navbar-language-pill"
          href={languageHref(otherLocale)}
        >
          {locale === "ar" ? "EN" : "عربي"}
        </Link>
        <Link
          aria-label={notificationsLabel}
          className="navbar-icon-button navbar-notifications"
          href={withLocale("/notifications")}
        >
          <Bell aria-hidden="true" size={18} />
          <span aria-label="3" className="navbar-unread-count">3</span>
        </Link>
        <Link className="navbar-account-pill" href={user ? accountHref : withLocale("/login")}>
          <UserRound aria-hidden="true" size={16} />
          {user ? locale === "ar" ? "حسابي" : "My account" : nav.login}
        </Link>
        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen
            ? locale === "ar" ? "إغلاق القائمة" : "Close menu"
            : locale === "ar" ? "فتح القائمة" : "Open menu"}
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>
      </div>
    </header>
    {menuOpen && (
      <div className="mobile-drawer-backdrop" onClick={() => setMenuOpen(false)}>
        <aside
          aria-label={menuLabel}
          aria-modal="true"
          className="mobile-drawer-panel"
          dir={locale === "ar" ? "rtl" : "ltr"}
          id="mobile-navigation"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <header className="mobile-drawer-header">
            <Link className="brand-mark" href={homeHref} onClick={() => setMenuOpen(false)}>
              <span aria-hidden="true" className="brand-symbol">C</span>
              <span>CommerceForge</span>
            </Link>
            <button aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"} className="navbar-icon-button" onClick={() => setMenuOpen(false)} type="button">
              <X aria-hidden="true" size={19} />
            </button>
          </header>
          <div className="mobile-drawer-quick-actions">
            <Link href={accountHref} onClick={() => setMenuOpen(false)}>
              <UserRound aria-hidden="true" size={19} />
              <span>{accountLabel}<small>{locale === "ar" ? "الحساب والربط بجوجل" : "Account and Google connection"}</small></span>
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
            <Link href={withLocale("/notifications")} onClick={() => setMenuOpen(false)}>
              <Bell aria-hidden="true" size={19} />
              <span>{notificationsLabel}<small>{locale === "ar" ? "تحديثات المتجر والقوالب" : "Store and template updates"}</small></span>
              <span className="mobile-drawer-count">3</span>
            </Link>
          </div>
          <nav aria-label={menuLabel} className="mobile-drawer-links">
            <Link href={homeHref} onClick={() => setMenuOpen(false)}><House aria-hidden="true" size={19} />{locale === "ar" ? "الرئيسية" : "Home"}</Link>
            <Link href={templatesHref} onClick={() => setMenuOpen(false)}><Store aria-hidden="true" size={19} />{locale === "ar" ? "معرض القوالب" : "Template gallery"}</Link>
            <Link href={pricingHref} onClick={() => setMenuOpen(false)}><CreditCard aria-hidden="true" size={19} />{nav.pricing}</Link>
            <Link href={user?.storeSlug ? withLocale("/dashboard/my-store") : withLocale("/launch")} onClick={() => setMenuOpen(false)}><Store aria-hidden="true" size={19} />{storeLabel}</Link>
            <Link href={contactHref} onClick={() => setMenuOpen(false)}><MessageCircle aria-hidden="true" size={19} />{nav.contact}</Link>
          </nav>
          <div className="mobile-drawer-footer">
            {user ? (
              <LogoutButton label={nav.logout} locale={locale} />
            ) : (
              <Link className="button-link mobile-drawer-login" href={withLocale("/login")} onClick={() => setMenuOpen(false)}>
                {locale === "ar" ? "تسجيل الدخول / إنشاء حساب" : "Sign in / Create account"}
              </Link>
            )}
            <a className="mobile-drawer-whatsapp" href="https://wa.me/201145335168" rel="noreferrer" target="_blank">
              {locale === "ar" ? "دعم واتساب 01145335168" : "WhatsApp support 01145335168"}
            </a>
          </div>
        </aside>
      </div>
    )}
    </>
  );
}
