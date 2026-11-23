import { AuthenticatedDashboardPage } from "@/components/dashboard/AuthenticatedDashboardPage";
import type { QueryValues } from "@/i18n/locale";

export default function DashboardOverview({ searchParams }: { searchParams: Promise<QueryValues> }) {
  return <AuthenticatedDashboardPage view="overview" searchParams={searchParams} />;
}
