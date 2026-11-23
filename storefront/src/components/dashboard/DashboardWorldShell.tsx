"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import type { MockLocale } from "@/mock/types";

export function DashboardWorldShell({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const locale: MockLocale = searchParams.get("lang") === "en" ? "en" : "ar";
  return (
    <div className="merchant-world-shell" dir={locale === "ar" ? "rtl" : "ltr"}>
      {children}
      <Footer locale={locale} />
    </div>
  );
}
