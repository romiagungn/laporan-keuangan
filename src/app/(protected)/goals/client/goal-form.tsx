"use client";

import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createFinancialGoal } from "@/lib/actions/goal.actions";
import { useEffect } from "react";
import { toast } from "sonner";

const FinancialGoalSchema = z.object({
  name: z.string().min(3, { message: "Nama tujuan minimal 3 karakter." }),
  targetAmount: z
    .number()
    .positive({ message: "Jumlah target harus positif." }),
  targetDate: z.date().optional(),
});

type FinancialGoalFormValues = z.infer<typeof FinancialGoalSchema>;

interface GoalFormProps {
  setOpen: (open: boolean) => void;
}

export function GoalForm({ setOpen }: GoalFormProps) {
  const [state, formAction] = useFormState(createFinancialGoal, null);

  const form = useForm<FinancialGoalFormValues>({
    resolver: zodResolver(FinancialGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, setOpen]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tujuan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Dana Liburan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Nominal</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Target (Opsional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    field.onChange(
                      e.target.value ? new Date(e.target.value) : undefined,
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Simpan
        </Button>
      </form>
    </Form>
  );
}
