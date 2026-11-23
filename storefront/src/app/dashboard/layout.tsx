import type { Metadata } from "next";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardWorldShell } from "@/components/dashboard/DashboardWorldShell";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "لوحة التاجر | CommerceForge",
    template: "%s | لوحة التاجر",
  },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();
  if (user && user.role !== "merchant") redirect("/manager?lang=ar");

  return (
    <div className="dashboard-shell merchant-dashboard-shell">
      <Suspense fallback={<div className="merchant-loading">CommerceForge</div>}>
        <DashboardWorldShell>
          {user && <DashboardNavigation user={user} />}
          <div className="dashboard-frame">
            <main className="dashboard-content">{children}</main>
          </div>
        </DashboardWorldShell>
      </Suspense>
    </div>
  );
}
