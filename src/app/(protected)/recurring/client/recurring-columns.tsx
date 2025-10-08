"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteRecurringTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { RecurringTransaction } from "@/lib/definitions";

const handleDelete = async (id: number) => {
  const result = await deleteRecurringTransaction(id);
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export const columns: ColumnDef<RecurringTransaction>[] = [
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <Badge variant={type === 'income' ? 'default' : 'destructive'}>{type}</Badge>
    }
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Jumlah</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "frequency",
    header: "Frekuensi",
    cell: ({ row }) => {
        const freq = row.getValue("frequency") as string;
        const formatted = freq.charAt(0).toUpperCase() + freq.slice(1);
        return <span>{formatted}</span>
    }
  },
  {
    accessorKey: "nextDate",
    header: "Jadwal Berikutnya",
    cell: ({ row }) => new Date(row.getValue("nextDate")).toLocaleDateString("id-ID"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleDelete(transaction.id)} className="text-red-500">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
