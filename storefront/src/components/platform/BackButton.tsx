"use client";

import { useRouter } from "next/navigation";
import type { MockLocale } from "@/mock/types";

export function BackButton({ locale, className = "navbar-utility-action" }: {
  locale: MockLocale;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      className={className}
      onClick={() => window.history.length > 1 ? router.back() : router.push(`/?lang=${locale}`)}
      type="button"
    >
      {locale === "ar" ? "رجوع" : "Back"}
    </button>
  );
}
