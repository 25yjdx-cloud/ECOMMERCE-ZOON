import type { Metadata } from "next";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";

export const metadata: Metadata = {
  title: {
    default: "لوحة المتجر التجريبية",
    template: "%s | لوحة المتجر التجريبية",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dashboard-shell" lang="ar" dir="rtl">
      <header className="dashboard-warning" role="alert">
        MOCK DATA - NOT SECURE
      </header>
      <div className="dashboard-frame">
        <DashboardNavigation />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
