"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBudget } from "@/lib/actions";
import { toast } from "sonner";

interface BudgetCardProps {
  id: number;
  categoryName: string;
  amount: string;
  spent: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const handleDelete = async (id: number) => {
  const result = await deleteBudget(id);
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
};

export function BudgetCard({ id, categoryName, amount, spent }: BudgetCardProps) {
  const budgetAmount = parseFloat(amount);
  const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
  const remaining = budgetAmount - spent;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{categoryName}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDelete(id)} className="text-red-500">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(budgetAmount)}</div>
        <p className="text-xs text-muted-foreground">
          Terpakai: {formatCurrency(spent)} | Sisa: {formatCurrency(remaining)}
        </p>
        <Progress value={progress} className="mt-4" />
      </CardContent>
    </Card>
  );
}
