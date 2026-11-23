import { AuthenticatedDashboardPage } from "@/components/dashboard/AuthenticatedDashboardPage";
import type { QueryValues } from "@/i18n/locale";

export default function DashboardSettingsPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  return <AuthenticatedDashboardPage view="settings" searchParams={searchParams} />;
}
