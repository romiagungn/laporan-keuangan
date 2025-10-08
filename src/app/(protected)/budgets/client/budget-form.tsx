"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createBudget } from "@/lib/actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  amount: z.number().positive("Jumlah harus positif."),
  categoryId: z.number().min(1, "Pilih kategori."),
  monthYear: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM)"),
});

type FormValues = z.infer<typeof formSchema>;

interface BudgetFormProps {
  setOpen: (open: boolean) => void;
  categories: { id: number; name: string }[];
}

export function BudgetForm({ setOpen, categories }: BudgetFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      categoryId: 0,
      monthYear: new Date().toISOString().slice(0, 7),
    },
  });

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.append("categoryId", values.categoryId.toString());
    formData.append("amount", values.amount.toString());
    formData.append("monthYear", values.monthYear);

    const result = await createBudget(null, formData);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... sisa JSX tidak berubah ... */}
        <FormField
          control={form.control}
          name="monthYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bulan & Tahun</FormLabel>
              <FormControl>
                <Input type="month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Anggaran</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}
