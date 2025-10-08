"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCategorySheet } from "@/hooks/use-category-sheet";
import { Category } from "@/lib/definitions";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";
import { useTransition } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori tidak boleh kosong."),
});

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useCategorySheet();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);

      const result = category
        ? await updateCategory(category.id, null, formData)
        : await createCategory(null, formData);

      if (result?.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result?.message || "Terjadi kesalahan");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="cth. Makanan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {category ? "Simpan Perubahan" : "Tambah"}
        </Button>
      </form>
    </Form>
  );
}
