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
import { createRecurringTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Jumlah harus positif"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.date(),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  source: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringFormProps {
  setOpen: (open: boolean) => void;
  categories: { id: number; name: string }[];
}

export function RecurringForm({ setOpen, categories }: RecurringFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        type: "expense",
        amount: 0,
        frequency: "monthly",
        startDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("type", values.type);
    formData.append("amount", values.amount.toString());
    formData.append("frequency", values.frequency);
    formData.append("startDate", values.startDate.toISOString());
    if (values.description) formData.append("description", values.description);
    if (values.categoryId) formData.append("categoryId", values.categoryId.toString());
    if (values.source) formData.append("source", values.source);

    const result = await createRecurringTransaction(null, formData);

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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Transaksi</FormLabel>
              <Select onValueChange={(value) => { field.onChange(value); setType(value as any); }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === 'expense' ? (
            <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
        ) : (
            <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Sumber Pemasukan</FormLabel>
                <FormControl>
                    <Input placeholder="Gaji" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frekuensi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih frekuensi..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Mulai</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Input placeholder="Cicilan mobil" {...field} />
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
