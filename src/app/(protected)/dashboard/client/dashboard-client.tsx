"use client";

import { CategoryChart } from "@/components/charts/category-chart";
import { getChartData, TimeRange } from "@/lib/actions";
import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  Users2,
  CreditCard,
  Activity,
  PlusCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseForm } from "./expense-form";
import { ExpenseActions } from "./expense-action";
import { ExpenseImporter } from "./expense-importer";
import type { Expense, Category } from "@/lib/definitions";
import { ExportButton } from "./export-button";
import { useRouter } from "next/navigation";

import { UserCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function RecentExpenses({
  expenses,
  onSuccess,
  categories,
}: {
  expenses: Expense[];
  onSuccess: () => void;
  categories: Category[];
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg border border-dashed shadow-sm p-4">
        <p className="text-sm text-muted-foreground text-center">
          Belum ada data pengeluaran.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">Detail</TableHead>
            <TableHead className="sm:hidden">Info</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="hidden sm:table-cell">
                <div className="font-medium">{expense.category}</div>
                <div className="text-sm text-muted-foreground truncate mb-1">
                  {expense.date || "Tanpa deskripsi"}
                </div>
                {expense.created_by && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <UserCircle2 className="h-3 w-3 mr-1" />
                    <span>{expense.created_by}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="sm:hidden">
                <div className="font-medium">{expense.category}</div>
                <div className="text-sm text-muted-foreground truncate mb-1">
                  {expense.date || "Tanpa deskripsi"}
                </div>
                {expense.created_by && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <UserCircle2 className="h-3 w-3 mr-1" />
                    <span>{expense.created_by}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="font-semibold">
                  {formatCurrency(Number(expense.amount))}
                </div>
                <Badge className="text-xs" variant="outline">
                  {expense.payment_method}
                </Badge>
              </TableCell>
              <TableCell>
                <ExpenseActions
                  expense={expense}
                  onSuccess={onSuccess}
                  categories={categories}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface DashboardClientProps {
  userName: string;
  initialLatestExpenses: Expense[];
  summaryData: {
    todayTotal: number;
    thisWeekTotal: number;
    thisMonthTotal: number;
    thisMonthCount: number;
  };
  categorySummary: { category: string; total: number }[];
  categories: Category[];
}

export function DashboardClient({
  userName,
  initialLatestExpenses,
  summaryData,
  categorySummary,
  categories,
}: DashboardClientProps) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("bulanan");
  const [chartData, setChartData] = useState(categorySummary);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsChartLoading(true);
      try {
        const data = await getChartData(timeRange);
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        setChartData([]);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome {userName}, Here’s a summary of your expenses.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap">
          <ExportButton />
          <ExpenseImporter />
          <ExpenseForm onSuccess={handleSuccess} categories={categories}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengeluaran
            </Button>
          </ExpenseForm>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Bulan Ini</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Tahun Ini
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Semua
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengeluaran Hari Ini
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summaryData.todayTotal)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengeluaran Minggu Ini
                </CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summaryData.thisWeekTotal)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengeluaran Bulan Ini
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summaryData.thisMonthTotal)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transaksi (Bulan)
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  +{summaryData.thisMonthCount}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <CardTitle>Ringkasan Kategori</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {(
                    ["harian", "mingguan", "bulanan", "tahunan"] as TimeRange[]
                  ).map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={timeRange === range ? "default" : "outline"}
                      onClick={() => setTimeRange(range)}
                      className="capitalize text-xs md:text-sm"
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                {isChartLoading ? (
                  <div className="flex h-[350px] w-full items-center justify-center">
                    <p className="text-muted-foreground">
                      Memuat data grafik...
                    </p>
                  </div>
                ) : chartData.length > 0 ? (
                  <CategoryChart data={chartData} />
                ) : (
                  <div className="flex h-[350px] w-full items-center justify-center rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Belum ada data untuk ditampilkan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Pengeluaran Terbaru</CardTitle>
                <CardDescription>5 transaksi terakhir Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentExpenses
                  expenses={initialLatestExpenses}
                  onSuccess={handleSuccess}
                  categories={categories}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
