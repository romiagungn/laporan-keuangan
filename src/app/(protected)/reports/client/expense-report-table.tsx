"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type PaginationState } from "@tanstack/react-table";

import { fetchFilteredExpenses } from "@/lib/actions/expense.actions";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Expense } from "@/lib/definitions";
import { DataTable } from "@/components/data-table";

interface ExpenseReportTableProps {
  initialExpenses: Expense[];
  initialTotalCount: number;
}

const PAGE_SIZE = 10;

export const ExpenseReportTable: React.FC<ExpenseReportTableProps> = ({
  initialExpenses,
  initialTotalCount,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [loading, setLoading] = useState<boolean>(false);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: (Number(searchParams.get("page")) || 1) - 1,
    pageSize: PAGE_SIZE,
  });

  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  );

  const pageCount = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageIndex + 1));
    router.replace(`${pathname}?${params.toString()}`);

    const fetchExpenses = async () => {
      setLoading(true);
      const from = searchParams.get("from") || undefined;
      const to = searchParams.get("to") || undefined;
      const categoryIds = searchParams
        .getAll("categoryId")
        .map(Number)
        .filter((id) => !isNaN(id));

      const { expenses: fetchedExpenses, totalCount: fetchedTotalCount } =
        await fetchFilteredExpenses({
          from,
          to,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
          page: pageIndex + 1,
          pageSize,
        });

      setExpenses(fetchedExpenses);
      setTotalCount(fetchedTotalCount);
      setLoading(false);
    };

    fetchExpenses();
  }, [
    pagination,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    searchParams.get("from"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    searchParams.get("to"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    searchParams.getAll("categoryId").toString(),
  ]);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }) => format(new Date(row.original.date), "dd MMMM yyyy"),
    },
    {
      accessorKey: "category",
      header: "Kategori",
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "amount",
      header: "Jumlah",
      cell: ({ row }) => {
        const amount = parseFloat(row.original.amount.toString());
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount);
      },
    },
    {
      accessorKey: "payment_method",
      header: "Metode Pembayaran",
    },
  ];

  return (
    <div className="space-y-4">
      {loading && <p>Loading data...</p>}
      <DataTable
        columns={columns}
        data={expenses}
        showPagination={true}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
};
