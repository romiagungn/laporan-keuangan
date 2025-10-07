"use client";

import { useState } from "react";
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
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseActions } from "@/components/expense-action";
import { ExpenseImporter } from "@/components/expense-importer";
import { fetchFilteredExpenses } from "@/lib/actions";
import type { Expense } from "@/lib/definitions";
import { ExportButton } from "@/components/export-button";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

function RecentExpenses({ expenses }: { expenses: Expense[] }) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Detail</TableHead>
          <TableHead className="text-right">Nominal</TableHead>
          <TableHead className="w-[40px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              <div className="font-medium">{expense.category}</div>
              <div className="text-sm text-muted-foreground truncate">
                {expense.description || "Tanpa deskripsi"}
              </div>
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
              <ExpenseActions expense={expense} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface DashboardClientProps {
  initialLatestExpenses: Expense[];
  summaryData: {
    todayTotal: number;
    thisWeekTotal: number;
    thisMonthTotal: number;
    thisMonthCount: number;
  };
}

export function DashboardClient({
  initialLatestExpenses,
  summaryData,
}: DashboardClientProps) {
  const [latestExpenses, setLatestExpenses] = useState<Expense[]>(
    initialLatestExpenses,
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const expenses = await fetchFilteredExpenses({});
      setLatestExpenses(expenses.slice(0, 5)); // Ensure we only show 5
    } catch (error) {
      console.error("Failed to refresh expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <ExportButton />
          <ExpenseImporter />
          <ExpenseForm>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Grafik (Segera Hadir)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 flex items-center justify-center h-[300px] bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Chart placeholder
                </p>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pengeluaran Terbaru</CardTitle>
                <CardDescription>5 transaksi terakhir Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center text-muted-foreground">
                    Memuat data...
                  </p>
                ) : (
                  <RecentExpenses expenses={latestExpenses} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
