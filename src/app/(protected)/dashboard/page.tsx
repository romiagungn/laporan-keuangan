import { fetchDashboardSummary, fetchFilteredExpenses } from "@/lib/actions";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const summaryData = await fetchDashboardSummary();
  const latestExpenses = await fetchFilteredExpenses({});

  return (
    <DashboardClient
      summaryData={summaryData}
      initialLatestExpenses={latestExpenses.slice(0, 5)}
    />
  );
}
