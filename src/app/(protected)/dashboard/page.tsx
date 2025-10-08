import {
  fetchDashboardSummary,
  fetchFilteredExpenses,
  fetchExpensesByCategory,
  getCategories,
} from "@/lib/actions";
import { DashboardClient } from "./client/dashboard-client";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const summaryData = await fetchDashboardSummary();
  const latestExpenses = await fetchFilteredExpenses({});
  const categories = await getCategories();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const categorySummary = await fetchExpensesByCategory({
    from: firstDayOfMonth.toISOString().split("T")[0],
    to: lastDayOfMonth.toISOString().split("T")[0],
  });

  return (
    <DashboardClient
      userName={session.name}
      summaryData={summaryData}
      initialLatestExpenses={latestExpenses.slice(0, 5)}
      categorySummary={categorySummary}
      categories={categories}
    />
  );
}
