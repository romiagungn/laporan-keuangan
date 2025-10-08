"use client";

import { useState, useCallback } from "react";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ExpenseForm } from "./expense-form";
import { deleteExpense } from "@/lib/actions";
import type { Category, Expense } from "@/lib/definitions";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction
      type="submit"
      disabled={pending}
      className="bg-red-600 hover:bg-red-700"
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        "Ya, Hapus"
      )}
    </AlertDialogAction>
  );
}

interface ExpenseActionsProps {
  expense: Expense;
  onSuccess: () => void;
  categories: Category[];
}

export function ExpenseActions({
  expense,
  onSuccess,
  categories,
}: ExpenseActionsProps) {
  const { toast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDelete = async (formData: FormData) => {
    const id = Number(formData.get("id"));
    if (!id) return;

    const result = await deleteExpense(id);

    if (result.success) {
      toast({
        title: "Berhasil!",
        description: result.message,
      });
      onSuccess();
    } else {
      toast({
        title: "Gagal Menghapus",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleSuccess = useCallback(() => {
    setDropdownOpen(false);
    onSuccess();
  }, [onSuccess]);

  return (
    <AlertDialog>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ExpenseForm
            expense={expense}
            onSuccess={handleSuccess}
            categories={categories}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
              }}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          </ExpenseForm>

          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-500 focus:text-red-500 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat diurungkan. Ini akan menghapus data
            pengeluaran Anda secara permanen dari server kami.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={expense.id} />
            <DeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
