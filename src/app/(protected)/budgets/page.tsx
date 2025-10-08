import { getBudgetsWithProgress, getCategories } from "@/lib/actions";
import { BudgetClient } from "./client/budget-client";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const budgets = await getBudgetsWithProgress();
  const categories = await getCategories();

  return <BudgetClient budgets={budgets} categories={categories} />;
}