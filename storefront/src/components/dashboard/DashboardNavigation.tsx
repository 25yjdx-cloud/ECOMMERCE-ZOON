"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { MockLocale } from "@/mock/types";

export function DashboardNavigation() {
  const searchParams = useSearchParams();
  const locale: MockLocale = searchParams.get("lang") === "en" ? "en" : "ar";
  const navigationItems = locale === "ar"
    ? [
        { href: "/dashboard", label: "نظرة عامة" },
        { href: "/dashboard/my-store", label: "متجري" },
        { href: "/dashboard/products", label: "المنتجات" },
        { href: "/dashboard/orders", label: "الطلبات" },
        { href: "/dashboard/stock", label: "المخزون" },
      ]
    : [
        { href: "/dashboard", label: "Overview" },
        { href: "/dashboard/my-store", label: "My store" },
        { href: "/dashboard/products", label: "Products" },
        { href: "/dashboard/orders", label: "Orders" },
        { href: "/dashboard/stock", label: "Stock" },
      ];

  return (
    <aside className="dashboard-sidebar">
      <Link className="dashboard-brand" href="/dashboard">
        CommerceForge
        <span>{locale === "ar" ? "لوحة المتجر" : "Store dashboard"}</span>
      </Link>
      <nav aria-label={locale === "ar" ? "تنقل لوحة المتجر" : "Store dashboard navigation"}>
        {navigationItems.map((item) => (
          <Link className="dashboard-nav-link" href={`${item.href}?lang=${locale}`} key={item.href}>
            {item.label}
          </Link>
        ))}
        <div className="dashboard-locale-switch">
          <Link href="/dashboard/my-store?lang=ar" aria-current={locale === "ar" ? "page" : undefined}>عربي</Link>
          <Link href="/dashboard/my-store?lang=en" aria-current={locale === "en" ? "page" : undefined}>EN</Link>
        </div>
        <LogoutButton label={locale === "ar" ? "تسجيل خروج" : "Sign out"} locale={locale} />
      </nav>
    </aside>
  );
}
