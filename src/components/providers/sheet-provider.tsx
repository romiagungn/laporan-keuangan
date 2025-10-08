"use client";

import { CategorySheet } from "@/components/sheets/category-sheet";
import { useEffect, useState } from "react";

export const SheetProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CategorySheet />
    </>
  );
};
