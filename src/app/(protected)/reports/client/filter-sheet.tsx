"use client";

import * as React from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCategories } from "@/lib/actions";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter, useSearchParams } from "next/navigation";

const FilterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  categoryIds: z.array(z.number()).optional(),
});

type FilterFormValues = z.infer<typeof FilterSchema>;

interface FilterSheetProps {
  onFilter?: (filters: FilterFormValues) => void;
}

export function FilterSheet({}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = React.useState<
    { id: number; name: string }[]
  >([]);

  React.useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      from: searchParams.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      to: searchParams.get("to") || new Date().toISOString().split("T")[0],
      categoryIds: searchParams.getAll("categoryId").map(Number),
    },
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const handleSubmit = (values: FilterFormValues) => {
    const params = new URLSearchParams(searchParams);
    if (values.from) {
      params.set("from", values.from);
    } else {
      params.delete("from");
    }
    if (values.to) {
      params.set("to", values.to);
    } else {
      params.delete("to");
    }
    if (values.categoryIds && values.categoryIds.length > 0) {
      params.delete("categoryId"); // Clear existing categoryIds
      values.categoryIds.forEach(id => params.append("categoryId", String(id)));
    } else {
      params.delete("categoryId");
    }
    params.set("page", "1"); // Reset page to 1 when filters change
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dari Tanggal</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sampai Tanggal</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <FormControl>
                <MultiSelect
                  options={categoryOptions}
                  value={field.value?.map(String) ?? []}
                  onChange={(selected) => field.onChange(selected.map(Number))}
                  placeholder="Pilih kategori..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Terapkan Filter
        </Button>
      </form>
    </Form>
  );
}
