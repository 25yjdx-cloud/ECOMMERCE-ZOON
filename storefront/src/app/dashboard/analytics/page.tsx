import { AuthenticatedDashboardPage } from "@/components/dashboard/AuthenticatedDashboardPage";
import type { QueryValues } from "@/i18n/locale";

export default function DashboardAnalyticsPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  return <AuthenticatedDashboardPage view="analytics" searchParams={searchParams} />;
}
