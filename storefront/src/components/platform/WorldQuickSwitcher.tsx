import Link from "next/link";
import type { AuthUser } from "@/lib/auth";
import type { MockLocale } from "@/mock/types";
import type { PresetId } from "@/lib/presets";

export function WorldQuickSwitcher({
  user,
  locale,
  preset = "classic",
  storeSlug,
}: {
  user: AuthUser | null;
  locale: MockLocale;
  preset?: PresetId;
  storeSlug?: string;
}) {
  if (!user) return null;

  const query = `?lang=${locale}`;
  const storefrontQuery = new URLSearchParams({ lang: locale });
  if (storeSlug) storefrontQuery.set("store", storeSlug);
  const worlds = [
    { href: `/${query}`, label: locale === "ar" ? "التسويق" : "Marketing" },
    { href: `/manager${query}`, label: locale === "ar" ? "مدير المنصة" : "Platform manager" },
    { href: `/dashboard/my-store${query}`, label: locale === "ar" ? "لوحة التاجر" : "Merchant dashboard" },
    { href: `/dashboard/orders${query}`, label: locale === "ar" ? "واجهة الموظفين" : "Staff workspace" },
    {
      href: storeSlug
        ? `/s/${encodeURIComponent(storeSlug)}?${storefrontQuery}`
        : `/preview/${preset}?${storefrontQuery}`,
      label: locale === "ar" ? "المتجر" : "Storefront",
    },
  ];

  return (
    <details className="world-quick-switcher">
      <summary>{locale === "ar" ? "مبدل العوالم الخمسة" : "5-world switcher"}</summary>
      <nav aria-label={locale === "ar" ? "التنقل بين العوالم الخمسة" : "Navigate the five worlds"}>
        {worlds.map((world) => (
          <Link href={world.href} key={world.label}>{world.label}</Link>
        ))}
      </nav>
    </details>
  );
}
