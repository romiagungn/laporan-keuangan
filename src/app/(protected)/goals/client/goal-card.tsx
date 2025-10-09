"use client";

import { FinancialGoal } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatRemainingDays } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddSavingsForm } from "./add-savings-form";
import * as React from "react";

interface GoalCardProps {
  goal: FinancialGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [open, setOpen] = React.useState(false);
  const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
  const remainingDays = goal.targetDate ? formatRemainingDays(goal.targetDate) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.name}</CardTitle>
        <CardDescription>
          Target: {formatCurrency(parseFloat(goal.targetAmount))}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Terkumpul</span>
            <span className="text-sm font-semibold">
              {formatCurrency(parseFloat(goal.currentAmount))}
            </span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">{progress.toFixed(2)}%</span>
            {remainingDays && (
              <span className="text-xs text-muted-foreground">
                {remainingDays}
              </span>
            )}
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Tabungan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{`Tambah Tabungan untuk "{goal.name}"`}</DialogTitle>
              <DialogDescription>
                Masukkan jumlah yang ingin Anda tambahkan ke tujuan ini.
              </DialogDescription>
            </DialogHeader>
            <AddSavingsForm goalId={goal.id} setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
