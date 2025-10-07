import {
  fetchDashboardSummary,
  fetchFilteredExpenses,
  fetchExpensesByCategory,
} from "@/lib/actions";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const summaryData = await fetchDashboardSummary();
  const latestExpenses = await fetchFilteredExpenses({});

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const categorySummary = await fetchExpensesByCategory({
    from: firstDayOfMonth.toISOString().split("T")[0],
    to: lastDayOfMonth.toISOString().split("T")[0],
  });

  return (
    <DashboardClient
      summaryData={summaryData}
      initialLatestExpenses={latestExpenses.slice(0, 5)}
      categorySummary={categorySummary}
    />
  );
}
