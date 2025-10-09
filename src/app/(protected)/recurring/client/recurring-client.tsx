"use client";

import * as React from "react";
import { PlusCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./recurring-columns";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecurringForm } from "./recurring-form";
import { processRecurringTransactions } from "@/lib/actions";
import { toast } from "sonner";
import { RecurringTransaction } from "@/lib/definitions";

interface RecurringClientProps {
  data: RecurringTransaction[];
  categories: { id: number; name: string }[];
}

export function RecurringClient({ data, categories }: RecurringClientProps) {
  const [open, setOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    const result = await processRecurringTransactions();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsProcessing(false);
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Transaksi Berulang</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleProcess} disabled={isProcessing}>
                {isProcessing ? "Memproses..." : <><Zap className="mr-2 h-4 w-4" /> Jalankan Proses</>}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Baru
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Buat Transaksi Berulang</DialogTitle>
                    <DialogDescription>
                        Akan membuat pemasukan/pengeluaran secara otomatis sesuai jadwal.
                    </DialogDescription>
                </DialogHeader>
                <RecurringForm setOpen={setOpen} categories={categories} />
                </DialogContent>
            </Dialog>
        </div>
      </div>
      <DataTable columns={columns} data={data} filterKey="description" />
    </>
  );
}
