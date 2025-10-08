"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Category } from "@/lib/definitions";
import { useCategorySheet } from "@/hooks/use-category-sheet";
import { deleteCategory } from "@/lib/actions/category.actions";
import { useTransition } from "react";
import { toast } from "sonner";

const ActionsCell: React.FC<{ row: { original: Category } }> = ({ row }) => {
  const [isPending, startTransition] = useTransition();
  const categorySheet = useCategorySheet();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(row.original.id);
      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.message || "Terjadi kesalahan");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => categorySheet.onOpen(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} disabled={isPending}>
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
