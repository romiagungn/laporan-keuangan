"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { createExpense, updateExpense } from "@/lib/actions";
import type { Expense } from "@/lib/definitions";

const FormSchema = z.object({
  amount: z.number().min(1, { message: "Please enter an amount." }),
  category: z.string().min(1, { message: "Please select a category." }),
  payment_method: z
    .string()
    .min(1, { message: "Please select a payment method." }),
  date: z.date().refine((val) => val instanceof Date && !isNaN(val.getTime()), {
    message: "Please select a valid date.",
  }),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof FormSchema>;

// FIX: Add onSuccess to the interface
interface ExpenseFormProps {
  expense?: Expense;
  children: React.ReactNode;
  onSuccess?: () => void;
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

// FIX: Accept onSuccess as a prop
export function ExpenseForm({ expense, children, onSuccess }: ExpenseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!expense;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: isEditMode ? Number(expense.amount) : NaN,
      category: isEditMode ? expense.category : "",
      payment_method: isEditMode ? expense.payment_method ?? "" : "",
      date: isEditMode ? new Date(expense.date) : new Date(),
      description: isEditMode ? expense.description || "" : "",
    },
  });

  const updateExpenseWithId = isEditMode
    ? updateExpense.bind(null, expense.id)
    : null;

  const [state, formAction] = useActionState<ActionState, FormData>(
    // @ts-ignore
    isEditMode && updateExpenseWithId ? updateExpenseWithId : createExpense,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast({
        title: isEditMode ? "Update Berhasil" : "Tambah Berhasil",
        description: state.message,
      });
      setIsOpen(false);
      form.reset();
      onSuccess?.(); // FIX: Call the onSuccess callback if it exists
    } else if (state.message && !state.success) {
      toast({
        variant: "destructive",
        title: isEditMode ? "Update Gagal" : "Tambah Gagal",
        description: state.message,
      });
    }
  }, [state, isEditMode, toast, form, onSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
          </DialogTitle>
        </DialogHeader>
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <input type="hidden" {...field} />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Makanan">Makanan</SelectItem>
                      <SelectItem value="Transportasi">Transportasi</SelectItem>
                      <SelectItem value="Tagihan">Tagihan</SelectItem>
                      <SelectItem value="Hiburan">Hiburan</SelectItem>
                      <SelectItem value="Belanja">Belanja</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
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
                  <input type="hidden" {...field} />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                  {field.value && (
                    <input
                      type="hidden"
                      name="date"
                      value={field.value.toISOString()}
                    />
                  )}
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
              <Button type="submit" className="w-full">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

