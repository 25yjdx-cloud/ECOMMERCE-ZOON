import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BackendConnectionStatus } from "./BackendConnectionStatus";
import { PlatformUtilities } from "@/components/theme/PlatformUtilities";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { WorldQuickSwitcher } from "@/components/platform/WorldQuickSwitcher";

export function PreviewTopbar({
  dictionary,
  locale,
  preset,
  query,
  user,
  pathname,
}: {
  dictionary: Dictionary;
  locale: MockLocale;
  preset: Preset;
  query: QueryValues;
  user: AuthUser | null;
  pathname?: string;
}) {
  const previewPath = `/preview/${preset.id}`;
  const currentPath = pathname ?? previewPath;

  return (
    <nav aria-label={dictionary.navigation.allPresets} className="preview-topbar">
      <div className="preview-topbar-links">
        <Link aria-label="CommerceForge" className="preview-brand-link" href={createLocaleHref("/", query, locale)}>
          <BrandLogo size={30} variant="mark" />
        </Link>
        <Link href={createLocaleHref("/", query, locale)}>{dictionary.navigation.backHome}</Link>
        <Link href={createLocaleHref("/templates", query, locale)}>{dictionary.navigation.allPresets}</Link>
        <Link href={createLocaleHref("/pricing", query, locale)}>{dictionary.navigation.pricing}</Link>
        <Link href={createLocaleHref("/#contact", query, locale)}>{dictionary.navigation.contact}</Link>
      </div>
      <div className="preview-topbar-center">
        <strong>{preset.name[locale]}</strong>
        <BackendConnectionStatus dictionary={dictionary} />
      </div>
      <div className="preview-topbar-actions">
        <Link href={createLocaleHref(
          user?.role === "super_admin" ? "/manager" : user?.role === "merchant" ? "/dashboard/my-store" : "/",
          query,
          locale,
        )}>
          {locale === "ar" ? "رجوع للمنصة" : "Back to platform"}
        </Link>
        {user?.role === "super_admin" ? (
          <>
            <WorldQuickSwitcher
              locale={locale}
              preset={preset.id}
              storeSlug={Array.isArray(query.store) ? query.store[0] : query.store}
              user={user}
            />
            <Link href={createLocaleHref(`/manager/${preset.id}`, query, locale)}>
              {dictionary.navigation.platformManager}
            </Link>
            <Link href={createLocaleHref("/admin/clients", { ...query, template: preset.id }, locale)}>
              {dictionary.navigation.cloneTemplate}
            </Link>
            <LogoutButton label={dictionary.navigation.logout} locale={locale} />
          </>
        ) : user?.role === "merchant" ? (
          <Link href={createLocaleHref(
            user.storeSlug ? "/dashboard/my-store" : "/launch",
            { ...query, ...(!user.storeSlug ? { template: preset.id } : {}) },
            locale,
          )}>
            {user.storeSlug ? dictionary.navigation.myStore : dictionary.navigation.startWithTemplate}
          </Link>
        ) : (
          <Link href={createLocaleHref("/launch", { ...query, template: preset.id }, locale)}>
            {dictionary.navigation.startWithTemplate}
          </Link>
        )}
        {!user && (
          <Link href={createLocaleHref("/login", query, locale)}>
            {dictionary.navigation.login}
          </Link>
        )}
        <PlatformUtilities
          compact
          currentPath={currentPath}
          locale={locale}
          profileHref={user?.role === "merchant" ? "/dashboard/my-store" : "/login"}
          query={query}
          user={user}
        />
      </div>
    </nav>
  );
}
