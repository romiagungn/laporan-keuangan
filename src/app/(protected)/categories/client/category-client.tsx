"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./category-columns";
import { Category } from "@/lib/definitions";
import { useCategorySheet } from "@/hooks/use-category-sheet";

interface CategoryClientProps {
  data: Category[];
}

export const CategoryClient: React.FC<CategoryClientProps> = ({ data }) => {
  const categorySheet = useCategorySheet();

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kategori</h1>
        <Button onClick={() => categorySheet.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>
      <DataTable columns={columns} data={data} filterKey="name" />
    </>
  );
};
