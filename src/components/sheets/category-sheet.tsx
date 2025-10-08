"use client";

import { useCategorySheet } from "@/hooks/use-category-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CategoryForm } from "@/app/(protected)/categories/client/category-form";

export const CategorySheet = () => {
  const { isOpen, onClose, category } = useCategorySheet();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{category ? "Edit Kategori" : "Tambah Kategori"}</SheetTitle>
        </SheetHeader>
        <CategoryForm category={category} />
      </SheetContent>
    </Sheet>
  );
};
