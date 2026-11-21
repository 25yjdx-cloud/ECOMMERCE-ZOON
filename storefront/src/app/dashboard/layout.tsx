import type { Metadata } from "next";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardWorldShell } from "@/components/dashboard/DashboardWorldShell";

export const metadata: Metadata = {
  title: {
    default: "لوحة المتجر التجريبية",
    template: "%s | لوحة المتجر التجريبية",
  },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();
  if (!user) redirect("/login?lang=ar&redirect=%2Fdashboard%2Fmy-store");
  if (user.role !== "merchant") redirect("/manager/classic?lang=ar");

  return (
    <div className="dashboard-shell">
      <DashboardWorldShell user={user}>
        <div className="dashboard-frame">
          <Suspense fallback={null}><DashboardNavigation memberRole={user.memberRole ?? null} /></Suspense>
          <div className="dashboard-content">{children}</div>
        </div>
      </DashboardWorldShell>
    </div>
  );
}
