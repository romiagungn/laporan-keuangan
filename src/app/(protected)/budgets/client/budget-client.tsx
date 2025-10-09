"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BudgetForm } from "./budget-form";
import { BudgetCard } from "./budget-card";

interface BudgetClientProps {
  budgets: {
    id: number;
    amount: string;
    categoryName: string;
    categoryId: number;
    month: number;
    year: number;
    spent: number;
  }[];
  categories: { id: number; name: string }[];
}

export function BudgetClient({ budgets, categories }: BudgetClientProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Anggaran Bulan Ini</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Buat Anggaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Anggaran Baru</DialogTitle>
              <DialogDescription>
                Buat atau perbarui anggaran untuk kategori tertentu di bulan ini.
              </DialogDescription>
            </DialogHeader>
            <BudgetForm setOpen={setOpen} categories={categories} />
          </DialogContent>
        </Dialog>
      </div>
      {budgets.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              id={budget.id}
              categoryName={budget.categoryName}
              amount={budget.amount}
              spent={budget.spent}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
          <h3 className="text-lg font-semibold">Belum Ada Anggaran</h3>
          <p className="text-sm text-muted-foreground">
            {`Anda belum membuat anggaran untuk bulan ini. Mulai dengan menekan tombol "Buat Anggaran".`}
          </p>
        </div>
      )}
    </>
  );
}
