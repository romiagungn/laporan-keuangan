"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./income-columns";
import { Income } from "@/lib/definitions";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IncomeForm } from "./income-form";

interface IncomeClientProps {
  data: Income[];
}

export function IncomeClient({ data }: IncomeClientProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Pemasukan</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pemasukan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pemasukan Baru</DialogTitle>
              <DialogDescription>
                Isi detail pemasukan Anda di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <IncomeForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={data} filterKey="source" />
    </>
  );
}
