"use client";

import { useTransition } from "react";
import Papa from "papaparse";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllExpenses } from "@/lib/actions";

export function ExportButton() {
  const [isExporting, startTransition] = useTransition();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const handleExport = async () => {
    startTransition(async () => {
      try {
        const filters = {
          from: searchParams.get("from") || undefined,
          to: searchParams.get("to") || undefined,
          categoryIds: searchParams.getAll("categoryId").map(Number) || undefined,
        };

        const data = await fetchAllExpenses(filters);

        if (!data || data.length === 0) {
          toast({
            variant: "destructive",
            title: "Export Failed",
            description: "No data available to export for the selected filters.",
          });
          return;
        }

        const formattedData = data.map((item) => ({
          Tanggal: item.date,
          Kategori: item.category,
          Deskripsi: item.description,
          Jumlah: item.amount,
          "Metode Pembayaran": item.payment_method,
        }));

        const csv = Papa.unparse(formattedData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const filename = `pengeluaran-export-${new Date().toISOString().split("T")[0]}.csv`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Successfully exported ${data.length} transactions.`,
        });
      } catch (error) {
        console.error("Export Error:", error);
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: "An error occurred while exporting data.",
        });
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  );
}
