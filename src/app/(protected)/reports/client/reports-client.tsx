"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryChart } from "@/components/charts/category-chart";
import { InsightCard } from "@/components/shareds/insight-card";
import { fetchExpensesByCategory, getSpendingInsight } from "@/lib/actions";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterSheet } from "./filter-sheet";

import { CustomReportsManager } from "./custom-reports-manager";

interface ReportsClientProps: {
  initialCategoryData: any[];
  initialInsightData: any;
}

export function ReportsClient({ initialCategoryData, initialInsightData }: ReportsClientProps) {
  const [categoryData, setCategoryData] = React.useState(initialCategoryData);
  const [insightData, setInsightData] = React.useState(initialInsightData);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFilter = async (filters: any) => {
    setIsLoading(true);
    const [newCategoryData, newInsightData] = await Promise.all([
      fetchExpensesByCategory(filters),
      getSpendingInsight("bulanan", filters), // Assuming getSpendingInsight can take filters
    ]);
    setCategoryData(newCategoryData);
    setInsightData(newInsightData);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">
          Laporan & Statistik
        </h2>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Laporan</SheetTitle>
                <SheetDescription>
                  Pilih kriteria untuk memfilter laporan Anda.
                </SheetDescription>
              </SheetHeader>
              <FilterSheet onFilter={handleFilter} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <CustomReportsManager />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>
              Distribusi pengeluaran Anda berdasarkan kategori.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <div className="h-[350px] w-full flex items-center justify-center">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : categoryData.length > 0 ? (
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
        <InsightCard isLoading={isLoading} insight={insightData} />
      </div>
    </div>
  );
}
