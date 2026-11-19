import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { createLocaleHref, type QueryValues } from "@/i18n/locale";
import type { Preset } from "@/lib/presets";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

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
        <Link href={createLocaleHref("/", query, locale)}>{dictionary.navigation.backHome}</Link>
        <Link href={createLocaleHref("/templates", query, locale)}>{dictionary.navigation.allPresets}</Link>
        <Link href={createLocaleHref("/pricing", query, locale)}>{dictionary.navigation.pricing}</Link>
        <Link href={createLocaleHref("/#contact", query, locale)}>{dictionary.navigation.contact}</Link>
      </div>
      <div className="preview-topbar-center">
        <strong>{preset.name[locale]}</strong>
        <span className="connection-pending">{dictionary.navigation.backendPending}</span>
      </div>
      <div className="preview-topbar-actions">
        {user?.role === "super_admin" ? (
          <>
            <Link href={createLocaleHref(`/manager/${preset.id}`, query, locale)}>
              {dictionary.navigation.platformManager}
            </Link>
            <Link href={createLocaleHref("/admin/clients", { ...query, template: preset.id }, locale)}>
              {dictionary.navigation.cloneTemplate}
            </Link>
            <LogoutButton label={dictionary.navigation.logout} locale={locale} />
          </>
        ) : user?.role === "merchant" ? (
          <Link href={createLocaleHref("/dashboard/my-store", query, locale)}>
            {dictionary.navigation.myStore}
          </Link>
        ) : (
          <Link href={createLocaleHref("/login", { ...query, template: preset.id }, locale)}>
            {dictionary.navigation.startWithTemplate}
          </Link>
        )}
        {!user && (
          <Link href={createLocaleHref("/login", query, locale)}>
            {dictionary.navigation.login}
          </Link>
        )}
        <Link href={createLocaleHref(currentPath, query, "ar")}>
          {dictionary.navigation.languageArabic}
        </Link>
        <Link href={createLocaleHref(currentPath, query, "en")}>
          {dictionary.navigation.languageEnglish}
        </Link>
      </div>
    </nav>
  );
}
