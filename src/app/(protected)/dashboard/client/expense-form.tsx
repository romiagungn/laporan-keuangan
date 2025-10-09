"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as indonesiaLocale } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { createExpense, updateExpense } from "@/lib/actions";
import type { Category, Expense } from "@/lib/definitions";
import { ReceiptScanner } from "./receipt-scanner";

const FormSchema = z.object({
  amount: z.number().min(1, { message: "Please enter an amount." }),
  categoryId: z.number().min(1, { message: "Please select a category." }),
  payment_method: z
    .string()
    .min(1, { message: "Please select a payment method." }),
  date: z.date().refine((val) => val instanceof Date && !isNaN(val.getTime()), {
    message: "Please select a valid date.",
  }),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof FormSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  children: React.ReactNode;
  onSuccess?: () => void;
  categories: Category[];
}

type ActionState = {
  message: string | null;
  errors?: Partial<Record<keyof ExpenseFormValues, string[]>>;
  success: boolean;
};

const initialState: ActionState = {
  message: null,
  errors: {},
  success: false,
};

export function ExpenseForm({
  expense,
  children,
  onSuccess,
  categories,
}: ExpenseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!expense;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: isEditMode ? Number(expense.amount) : NaN,
      categoryId: isEditMode
        ? categories.find((c) => c.name === expense.category)?.id
        : undefined,
      payment_method: isEditMode ? (expense.payment_method ?? "") : "",
      date: isEditMode ? new Date(expense.date) : new Date(),
      description: isEditMode ? expense.description || "" : "",
    },
  });

  useEffect(() => {
    if (isEditMode && categories.length > 0) {
      const categoryId = categories.find(
        (c) => c.name === expense.category,
      )?.id;
      form.setValue("categoryId", categoryId || 0);
    }
  }, [categories, expense, form, isEditMode]);

  const updateExpenseWithId = isEditMode
    ? updateExpense.bind(null, expense.id)
    : null;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    // @ts-ignore
    isEditMode && updateExpenseWithId ? updateExpenseWithId : createExpense,
    initialState,
  );

  useEffect(() => {
    if (state.message === null) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      setIsOpen(false);
      form.reset();
      onSuccess?.();
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleScanSuccess = (data: {
    amount: number | null;
    date: Date | null;
    description: string | null;
  }) => {
    if (data.amount) {
      form.setValue("amount", data.amount);
    }
    if (data.date) {
      form.setValue("date", data.date);
    }
    if (data.description) {
      form.setValue("description", data.description);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
          </DialogTitle>
        </DialogHeader>
        <div className="my-4">
          <ReceiptScanner onScanSuccess={handleScanSuccess}>
            <Button type="button" variant="outline" className="w-full">
              Pindai Struk
            </Button>
          </ReceiptScanner>
        </div>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? NaN : e.target.valueAsNumber,
                        )
                      }
                      value={isNaN(field.value) ? "" : field.value}
                    />
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
                  <input
                    type="hidden"
                    name="categoryId"
                    value={field.value || ""}
                  />
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
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
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Pembayaran</FormLabel>
                  <input
                    type="hidden"
                    name="payment_method"
                    value={field.value || ""}
                  />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="E-wallet">E-wallet</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
                  {field.value &&
                    (() => {
                      const localDate = field.value;
                      const timezoneOffset =
                        localDate.getTimezoneOffset() * 60000;
                      const correctedDate = new Date(
                        localDate.getTime() - timezoneOffset,
                      );
                      const dateString = correctedDate
                        .toISOString()
                        .split("T")[0];

                      return (
                        <input type="hidden" name="date" value={dateString} />
                      );
                    })()}
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", {
                              locale: indonesiaLocale,
                            })
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
                        disabled={(date) => date > new Date()}
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
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Makan siang di warteg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
