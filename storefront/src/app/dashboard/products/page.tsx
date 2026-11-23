import { AuthenticatedDashboardPage } from "@/components/dashboard/AuthenticatedDashboardPage";
import type { QueryValues } from "@/i18n/locale";

export default function DashboardProductsPage({ searchParams }: { searchParams: Promise<QueryValues> }) {
  return <AuthenticatedDashboardPage view="products" searchParams={searchParams} />;
}
