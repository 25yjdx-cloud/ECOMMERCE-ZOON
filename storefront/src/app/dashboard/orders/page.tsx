import { AuthenticatedDashboardPage } from "@/components/dashboard/AuthenticatedDashboardPage";
import type { QueryValues } from "@/i18n/locale";

export default function DashboardOrdersPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  return <AuthenticatedDashboardPage view="orders" searchParams={searchParams} />;
}
