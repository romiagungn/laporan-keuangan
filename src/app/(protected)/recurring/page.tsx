import { getRecurringTransactions, getCategories } from "@/lib/actions";
import { RecurringClient } from "./client/recurring-client";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const transactions = await getRecurringTransactions();
  const categories = await getCategories();

  return <RecurringClient data={transactions} categories={categories} />;
}