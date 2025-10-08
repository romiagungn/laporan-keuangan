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
import { deleteIncome } from "@/lib/actions";
import { toast } from "sonner";
import { Income } from "@/lib/definitions";

const handleDelete = async (id: number) => {
  const result = await deleteIncome(id);
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
};

export const columns: ColumnDef<Income>[] = [
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString("id-ID"),
  },
  {
    accessorKey: "source",
    header: "Sumber",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Jumlah</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const income = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(income.id.toString())}
            >
              Salin ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(income.id)} className="text-red-500">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
