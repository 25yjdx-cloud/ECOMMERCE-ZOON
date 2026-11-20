"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { getDictionary } from "@/i18n/dictionaries";
import type { MockLocale } from "@/mock/types";
import type { AuthUser } from "@/lib/auth";

export function DashboardWorldShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const locale: MockLocale = searchParams.get("lang") === "en" ? "en" : "ar";
  const query = Object.fromEntries(searchParams.entries());

  return (
    <>
      <LandingHeader
        basePath="/dashboard/my-store"
        dictionary={getDictionary(locale)}
        locale={locale}
        query={query}
        user={user}
      />
      {children}
      <Footer locale={locale} />
    </>
  );
}
