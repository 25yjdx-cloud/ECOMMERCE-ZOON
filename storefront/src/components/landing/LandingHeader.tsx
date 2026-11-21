"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CreditCard, House, Menu, MessageCircle, Moon, Store, Sun, UserRound, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useTheme } from "@/components/theme/ThemeProvider";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketSwitcher } from "./MarketSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { WorldQuickSwitcher } from "@/components/platform/WorldQuickSwitcher";

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
    <header className={`site-header landing-nav sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md border-b${user ? " is-authenticated" : ""}`}>
      <div className="navbar-inner">
      <Link className="brand-mark" href={homeHref} aria-label="CommerceForge">
        <BrandLogo size={42} showArabicSubtitle={false} variant="horizontal" />
      </Link>
      <nav aria-label={menuLabel} className="navbar-center-links">
        <Link className="navbar-home-link" href={homeHref}>{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        <Link className="navbar-templates-link" href={templatesHref}>{locale === "ar" ? "القوالب" : "Templates"}</Link>
        <Link className="navbar-pricing-link" href={pricingHref}>{nav.pricing}</Link>
        <Link className="navbar-contact-link" href={contactHref}>{nav.contact}</Link>
      </nav>
      <div className="navbar-controls">
        {user && (
          <>
            <button
              className="navbar-utility-action"
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign(homeHref)}
              type="button"
            >
              {locale === "ar" ? "رجوع" : "Back"}
            </button>
            <Link className="navbar-utility-action" href={homeHref}>
              {locale === "ar" ? "الرئيسية" : "Home"}
            </Link>
          </>
        )}
        <MarketSwitcher locale={locale} />
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
        {user && <NotificationBell buttonClassName="navbar-icon-button navbar-notifications" locale={locale} />}
        <WorldQuickSwitcher locale={locale} storeSlug={user?.storeSlug ?? undefined} user={user} />
        {user && <LogoutButton label={nav.logout} locale={locale} />}
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
            <Link className="mobile-drawer-brand" href={homeHref} onClick={() => setMenuOpen(false)}>
              CommerceForge
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
            {user && (
              <div className="mobile-drawer-notification">
                <NotificationBell buttonClassName="navbar-icon-button" locale={locale} />
                <span>{notificationsLabel}</span>
              </div>
            )}
          </div>
          <nav aria-label={menuLabel} className="mobile-drawer-links">
            <Link href={homeHref} onClick={() => setMenuOpen(false)}><House aria-hidden="true" size={19} />{locale === "ar" ? "الرئيسية" : "Home"}</Link>
            <Link href={templatesHref} onClick={() => setMenuOpen(false)}><Store aria-hidden="true" size={19} />{locale === "ar" ? "معرض القوالب" : "Template gallery"}</Link>
            <Link href={pricingHref} onClick={() => setMenuOpen(false)}><CreditCard aria-hidden="true" size={19} />{nav.pricing}</Link>
            <Link href={user?.storeSlug ? withLocale("/dashboard/my-store") : withLocale("/launch")} onClick={() => setMenuOpen(false)}><Store aria-hidden="true" size={19} />{storeLabel}</Link>
            <Link href={contactHref} onClick={() => setMenuOpen(false)}><MessageCircle aria-hidden="true" size={19} />{nav.contact}</Link>
          </nav>
          <div className="mobile-drawer-footer">
            <MarketSwitcher locale={locale} />
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
