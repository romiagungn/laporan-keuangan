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
import { GoalForm } from "./goal-form";
import { GoalCard } from "./goal-card";
import { FinancialGoal } from "@/lib/definitions";

interface GoalClientProps {
  goals: FinancialGoal[];
}

export function GoalClient({ goals }: GoalClientProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Tujuan Keuangan</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Buat Tujuan Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Tujuan Keuangan Baru</DialogTitle>
              <DialogDescription>
                Tentukan target dan mulai menabung untuk mencapainya.
              </DialogDescription>
            </DialogHeader>
            <GoalForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {goals.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
          <h3 className="text-lg font-semibold">Belum Ada Tujuan</h3>
          <p className="text-sm text-muted-foreground">
            {`Anda belum membuat tujuan keuangan. Mulai dengan menekan tombol "Buat Tujuan Baru".`}
          </p>
        </div>
      )}
    </>
  );
}
