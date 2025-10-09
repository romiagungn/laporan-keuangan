import { fetchExpensesByCategory, getSpendingInsight } from "@/lib/actions";
import { ReportsClient } from "./client/reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const initialCategoryData = await fetchExpensesByCategory({
    from: firstDayOfMonth.toISOString().split("T")[0],
    to: lastDayOfMonth.toISOString().split("T")[0],
  });

  const initialInsightData = await getSpendingInsight("bulanan");

  return (
    <ReportsClient
      initialCategoryData={initialCategoryData}
      initialInsightData={initialInsightData}
    />
  );
}
