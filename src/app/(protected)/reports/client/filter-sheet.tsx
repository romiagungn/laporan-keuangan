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

const FilterSchema = z.object({
  from: z.date(),
  to: z.date(),
  categoryIds: z.array(z.number()).optional(),
});

type FilterFormValues = z.infer<typeof FilterSchema>;

interface FilterSheetProps {
  onFilter: (filters: FilterFormValues) => void;
}

export function FilterSheet({ onFilter }: FilterSheetProps) {
  const [categories, setCategories] = React.useState<
    { id: number; name: string }[]
  >([]);

  React.useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
      categoryIds: [],
    },
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const handleSubmit = (values: FilterFormValues) => {
    onFilter(values);
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
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sampai Tanggal</FormLabel>
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
