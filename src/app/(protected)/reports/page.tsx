import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchExpensesByCategory, getSpendingInsight } from "@/lib/actions";
import { CategoryChart } from "@/components/charts/category-chart";
import { InsightCard } from "@/components/shareds/insight-card";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const categoryData = await fetchExpensesByCategory({
    from: firstDayOfMonth.toISOString().split("T")[0],
    to: lastDayOfMonth.toISOString().split("T")[0],
  });

  const insightData = await getSpendingInsight("bulanan");

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Laporan & Statistik
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>
              Distribusi pengeluaran Anda berdasarkan kategori bulan ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {categoryData.length > 0 ? (
              <CategoryChart data={categoryData} chartType="pie" />
            ) : (
              <div className="h-[350px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Belum ada data untuk ditampilkan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <InsightCard isLoading={false} insight={insightData} />
      </div>
    </div>
  );
}
