import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/auth";
import type { MockLocale } from "@/mock/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { WorldQuickSwitcher } from "@/components/platform/WorldQuickSwitcher";

export function StorefrontPageShell({
  slug,
  storeName,
  locale,
  user,
  children,
}: {
  slug: string;
  storeName: string;
  locale: MockLocale;
  user: AuthUser | null;
  children: ReactNode;
}) {
  const isArabic = locale === "ar";
  const base = `/s/${encodeURIComponent(slug)}`;

  return (
    <div className="storefront-utility-page" dir={isArabic ? "rtl" : "ltr"} lang={locale}>
      <header className="store-topbar">
        <Link className="brand-mark" href={`${base}?lang=${locale}`}>
          <BrandLogo size={32} variant="mark" />
          <span>{storeName}</span>
        </Link>
        <nav aria-label={isArabic ? "التنقل في المتجر" : "Store navigation"} className="store-topbar-actions">
          <Link href={`${base}/track?lang=${locale}`}>{isArabic ? "تتبع طلبك" : "Track your order"}</Link>
          <Link href={`${base}/returns?lang=${locale}`}>{isArabic ? "الاستبدال والاسترجاع" : "Returns & exchange"}</Link>
          <WorldQuickSwitcher locale={locale} storeSlug={slug} user={user} />
        </nav>
      </header>
      <main className="page-shell">
        <Link className="button-link secondary store-back-link" href={`${base}?lang=${locale}`}>
          {isArabic ? "العودة إلى المتجر" : "Back to store"}
        </Link>
        {children}
      </main>
      <footer className="page-shell site-footer">
        <span>{storeName}</span>
        <nav aria-label={isArabic ? "روابط المتجر" : "Store links"}>
          <Link href={`${base}/track?lang=${locale}`}>{isArabic ? "تتبع طلبك" : "Track your order"}</Link>
          <Link href={`${base}/returns?lang=${locale}`}>{isArabic ? "الاستبدال والاسترجاع" : "Returns & exchange"}</Link>
        </nav>
      </footer>
    </div>
  );
}
