import { fetchExpensesByCategory, getSpendingInsight, fetchFilteredExpenses } from "@/lib/actions";
import { ReportsClient } from "./client/reports-client";
import { ExpenseReportTable } from "./client/expense-report-table"; // Import the new component
import { Suspense } from "react"; // Import Suspense

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: {
    from?: string;
    to?: string;
    categoryId?: string;
    page?: string;
  };
}) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const from = searchParams?.from || firstDayOfMonth.toISOString().split("T")[0];
  const to = searchParams?.to || lastDayOfMonth.toISOString().split("T")[0];
  const categoryId = searchParams?.categoryId ? Number(searchParams.categoryId) : undefined;
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 10; // Should match the pageSize in ExpenseReportTable

  const initialCategoryData = await fetchExpensesByCategory({
    from,
    to,
    categoryIds: categoryId ? [categoryId] : undefined,
  });

  const initialInsightData = await getSpendingInsight("bulanan");

  const { expenses: initialExpenses, totalCount: initialTotalCount } = await fetchFilteredExpenses({
    from,
    to,
    categoryIds: categoryId ? [categoryId] : undefined,
    page: currentPage,
    pageSize,
  });

  return (
    <>
      <ReportsClient
        initialCategoryData={initialCategoryData}
        initialInsightData={initialInsightData}
      />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Daftar Pengeluaran</h2>
        <Suspense fallback={<div>Memuat pengeluaran...</div>}>
          <ExpenseReportTable
            initialExpenses={initialExpenses}
            initialTotalCount={initialTotalCount}
          />
        </Suspense>
      </div>
    </>
  );
}
