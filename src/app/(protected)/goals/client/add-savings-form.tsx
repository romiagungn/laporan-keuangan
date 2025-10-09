"use client";

import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addSavingsToGoal } from "@/lib/actions/goal.actions";
import { useEffect } from "react";
import { toast } from "sonner";

const AddSavingsSchema = z.object({
  amount: z.number().positive({ message: "Jumlah harus positif." }),
});

type AddSavingsFormValues = z.infer<typeof AddSavingsSchema>;

interface AddSavingsFormProps {
  goalId: number;
  setOpen: (open: boolean) => void;
}

export function AddSavingsForm({ goalId, setOpen }: AddSavingsFormProps) {
  const [state, formAction] = useFormState(addSavingsToGoal, null);

  const form = useForm<AddSavingsFormValues>({
    resolver: zodResolver(AddSavingsSchema),
    defaultValues: {
      amount: 0,
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
        <input type="hidden" name="goalId" value={goalId} />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Tabungan</FormLabel>
              <FormControl>
                <Input type="number" placeholder="500000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Simpan</Button>
      </form>
    </Form>
  );
}
