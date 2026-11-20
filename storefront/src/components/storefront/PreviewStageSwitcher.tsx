"use client";

import Link from "next/link";
import type { MockLocale } from "@/mock/types";

export function PreviewStageSwitcher({
  slug,
  locale,
  current,
}: {
  slug: string;
  locale: MockLocale;
  current: "starter" | "final" | "admin";
}) {
  const stages = [
    { id: "starter", href: `/preview/${slug}?lang=${locale}`, ar: "الهيكل الأساسي (70% انطلاق فوري)", en: "Starter structure (70% instant)" },
    { id: "final", href: `/final-preview/${slug}?lang=${locale}`, ar: "النتيجة النهائية (100%)", en: "Final result (100%)" },
    { id: "admin", href: `/final-preview/${slug}/admin-demo?lang=${locale}`, ar: "معاينة لوحة الإدارة", en: "Demo admin panel" },
  ] as const;

  return (
    <nav aria-label={locale === "ar" ? "مراحل المعاينة" : "Preview stages"} className="preview-stage-switcher">
      {stages.map((stage) => (
        <Link aria-current={current === stage.id ? "page" : undefined} href={stage.href} key={stage.id}>
          {locale === "ar" ? stage.ar : stage.en}
        </Link>
      ))}
    </nav>
  );
}
