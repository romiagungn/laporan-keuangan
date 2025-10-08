import { getIncomes } from "@/lib/actions";
import { IncomeClient } from "./client/income-client";

export const dynamic = 'force-dynamic';

export default async function IncomesPage() {
  const incomes = await getIncomes();

  return <IncomeClient data={incomes} />;
}