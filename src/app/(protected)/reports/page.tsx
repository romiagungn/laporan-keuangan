import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchExpensesByCategory } from "@/lib/actions";
import { CategoryChart } from "@/components/charts/category-chart";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const data = await fetchExpensesByCategory({});

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
            {data.length > 0 ? (
              <CategoryChart data={data} />
            ) : (
              <p className="text-sm text-muted-foreground p-8 text-center">
                Belum ada data untuk ditampilkan.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Insight (Segera Hadir)</CardTitle>
            <CardDescription>
              Analisis otomatis pengeluaran Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Fitur insight akan tersedia di sini.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
