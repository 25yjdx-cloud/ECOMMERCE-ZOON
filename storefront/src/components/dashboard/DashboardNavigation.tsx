"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ChevronLeft, ChevronRight, Files, House,
  Menu, PackagePlus, Search, Settings2, ShoppingBag, Store, X,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { WorldQuickSwitcher } from "@/components/platform/WorldQuickSwitcher";

type NavItem = { href: string; label: string; icon: typeof House };
type SearchHit = { type: "order" | "product" | "file"; title: string; detail: string; href: string };

const labels = {
  ar: {
    home: "الرئيسية", orders: "الطلبات والشحن", products: "المنتجات والمخزون",
    files: "المحتوى والملفات", storefront: "تخصيص المتجر", analytics: "التحليلات والتسويق",
    settings: "الإعدادات والفريق", quick: "بحث في الطلبات والمنتجات والملفات...",
    store: "متجري المباشر", more: "المزيد", add: "إضافة منتج", settingsShort: "الإعدادات",
    account: "حساب التاجر", profile: "ملفي الشخصي", plan: "ترقية الباقة", logout: "تسجيل الخروج",
    workspace: "لوحة التاجر", loading: "جارٍ البحث...", noResults: "لا توجد نتائج مطابقة.",
  },
  en: {
    home: "Home", orders: "Orders & shipping", products: "Products & inventory",
    files: "Content & files", storefront: "Storefront editor", analytics: "Analytics & marketing",
    settings: "Settings & team", quick: "Search orders, products, and files...",
    store: "Open my store", more: "More", add: "Add product", settingsShort: "Settings",
    account: "Merchant account", profile: "My profile", plan: "Upgrade plan", logout: "Sign out",
    workspace: "Merchant workspace", loading: "Searching...", noResults: "No matching results.",
  },
} satisfies Record<MockLocale, Record<string, string>>;

export function DashboardNavigation({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale: MockLocale = searchParams.get("lang") === "en" ? "en" : "ar";
  const text = labels[locale];
  const staff = user.memberRole === "staff" || user.memberRole === "order_manager";
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const items: NavItem[] = useMemo(() => {
    if (staff) return [{ href: "/dashboard/orders", label: text.orders, icon: ShoppingBag }];
    return [
      { href: "/dashboard", label: text.home, icon: House },
      { href: "/dashboard/orders", label: text.orders, icon: ShoppingBag },
      { href: "/dashboard/products", label: text.products, icon: Store },
      { href: "/dashboard/files", label: text.files, icon: Files },
      { href: "/dashboard/storefront", label: text.storefront, icon: Activity },
      { href: "/dashboard/analytics", label: text.analytics, icon: Activity },
      { href: "/dashboard/settings", label: text.settings, icon: Settings2 },
    ];
  }, [staff, text]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) return;
    const controller = new AbortController();
    void fetch("/api/merchant/search?q=" + encodeURIComponent(term), { signal: controller.signal, cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { data?: SearchHit[] }) => setHits(payload.data ?? []))
      .catch(() => { if (!controller.signal.aborted) setHits([]); })
      .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    return () => controller.abort();
  }, [search]);

  const title = items.find((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")))?.label ?? text.home;
  const query = "?lang=" + locale;

  function navLinks(className: string) {
    return items.map((item) => {
      const Icon = item.icon;
      const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
      return <Link aria-current={active ? "page" : undefined} className={className + (active ? " is-active" : "")} href={item.href + query} key={item.href} onClick={() => setDrawerOpen(false)} title={collapsed ? item.label : undefined}><Icon size={19} aria-hidden="true" /><span>{item.label}</span></Link>;
    });
  }

  return (
    <>
      <aside className={"merchant-sidebar" + (collapsed ? " is-collapsed" : "")}>
        <div className="merchant-sidebar-brand"><Link href="/dashboard" aria-label="CommerceForge"><BrandLogo size={37} showArabicSubtitle={false} variant="horizontal" /></Link><span className="merchant-brand-caption">CommerceForge · {text.workspace}</span><button type="button" className="merchant-collapse" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}>{collapsed ? (locale === "ar" ? <ChevronLeft size={17} /> : <ChevronRight size={17} />) : (locale === "ar" ? <ChevronRight size={17} /> : <ChevronLeft size={17} />)}</button></div>
        <p className="merchant-nav-caption">{locale === "ar" ? "إدارة المتجر" : "STORE MANAGEMENT"}</p>
        <nav aria-label={locale === "ar" ? "قائمة لوحة التاجر" : "Merchant workspace"}>{navLinks("merchant-nav-link")}</nav>
        {!staff && <div className="merchant-store-card"><span className="merchant-store-mark"><Store size={17} /></span><div><strong>{user.storeSlug ?? text.workspace}</strong><small>{user.memberRole === "owner" ? (locale === "ar" ? "باقة مجانية" : "Free plan") : text.workspace}</small></div>{user.storeSlug && <Link href={"/s/" + encodeURIComponent(user.storeSlug)} target="_blank" rel="noreferrer" aria-label={text.store}><ChevronLeft size={17} /></Link>}</div>}
        <div className="merchant-sidebar-bottom"><WorldQuickSwitcher locale={locale} user={user} storeSlug={user.storeSlug ?? undefined} />{!staff && <Link className="merchant-nav-link" href="/dashboard/settings?lang=ar"><Settings2 size={18} /><span>{text.settings}</span></Link>}</div>
      </aside>

      {drawerOpen && <button className="merchant-drawer-backdrop" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} type="button" />}
      <aside className={"merchant-mobile-drawer" + (drawerOpen ? " is-open" : "")} aria-hidden={!drawerOpen}>
        <div className="merchant-mobile-drawer-head"><BrandLogo size={34} showArabicSubtitle={false} /><button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close"><X size={19} /></button></div>
        <nav>{navLinks("merchant-nav-link")}</nav>
        <Link className="merchant-mobile-store-link" href={user.storeSlug ? "/s/" + encodeURIComponent(user.storeSlug) : "/dashboard"}>{text.store}</Link>
        <WorldQuickSwitcher locale={locale} user={user} storeSlug={user.storeSlug ?? undefined} />
      </aside>

      <header className="merchant-command-header">
        <div className="merchant-command-page"><button className="merchant-menu-button" onClick={() => setDrawerOpen(true)} type="button" aria-label="Open navigation"><Menu size={20} /></button><div><span>{text.home}</span><b>›</b><strong>{title}</strong></div></div>
        <div className="merchant-global-search"><Search size={18} /><input ref={searchRef} value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { const value = event.currentTarget.value; setSearch(value); setHits([]); setSearching(value.trim().length >= 2); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Enter" && hits[0]) router.push(hits[0].href); }} placeholder={text.quick} /><kbd>Ctrl K</kbd>{searchOpen && search.length >= 2 && <div className="merchant-search-results">{searching ? <p>{text.loading}</p> : hits.length ? hits.map((hit, index) => <Link key={hit.type + hit.title + index} href={hit.href} onClick={() => setSearchOpen(false)}><span>{hit.type === "order" ? <ShoppingBag size={16} /> : hit.type === "product" ? <Store size={16} /> : <Files size={16} />}</span><div><strong>{hit.title}</strong><small>{hit.detail}</small></div></Link>) : <p>{text.noResults}</p>}</div>}</div>
        <div className="merchant-command-actions"><NotificationBell locale={locale} buttonClassName="merchant-icon-button" />{!staff && <Link className="merchant-icon-button" href={"/dashboard/settings" + query} aria-label={text.settings}><Settings2 size={19} /></Link>}<div className="merchant-account-anchor"><button className="merchant-account-pill" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}><span className="merchant-account-avatar">{user.name.charAt(0).toUpperCase()}</span><span>{text.account}</span><ChevronLeft size={15} /></button>{accountOpen && <div className="merchant-account-menu"><strong>{user.name}</strong><small>{user.email}</small><Link href={"/account" + query}>{text.profile}</Link>{!staff && <Link href={"/dashboard/settings" + query + "&view=plan"}>{text.plan}</Link>}<LogoutButton label={text.logout} locale={locale} /></div>}</div></div>
      </header>

      <nav className="merchant-mobile-actions" aria-label={locale === "ar" ? "تنقل سريع" : "Quick navigation"}>
        <Link href={"/dashboard" + query}><House size={19} /><span>{text.home}</span></Link>
        <Link href={"/dashboard/orders" + query}><ShoppingBag size={19} /><span>{locale === "ar" ? "الطلبات" : "Orders"}</span></Link>
        {!staff && <Link className="merchant-add-product" href={"/dashboard/products" + query + "&new=1"}><PackagePlus size={20} /><span>+</span></Link>}
        {!staff && <Link href={"/dashboard/files" + query}><Files size={19} /><span>{locale === "ar" ? "الملفات" : "Files"}</span></Link>}
        <button type="button" onClick={() => setDrawerOpen(true)}><Menu size={19} /><span>{text.more}</span></button>
      </nav>
    </>
  );
}
