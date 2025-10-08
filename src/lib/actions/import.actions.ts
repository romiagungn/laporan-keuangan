'use server';

import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { expenses } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { Expense } from "@/lib/definitions";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";

async function getUserIdOrThrow() {
    const session = await getUserSession();
    if (!session?.userId) {
      throw new Error("Otentikasi diperlukan.");
    }
    return session;
}

export async function fetchAllExpenses(): Promise<
  Omit<Expense, "user_id" | "created_at" | "category">[]
> {
  console.log("--- fetchAllExpenses Request ---");
  try {
    const { userId } = await getUserIdOrThrow();
    const results = await db.query.expenses.findMany({
        where: eq(expenses.userId, parseInt(userId)),
        columns: {
            id: true,
            date: true,
            amount: true,
            description: true,
            categoryId: true
        },
        orderBy: [desc(expenses.date)]
    });
    const response = results.map(r => ({ ...r, amount: Number(r.amount) }));
    console.log("--- fetchAllExpenses Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil semua data pengeluaran untuk ekspor.");
  }
}

export async function importExpenses(fileContent: string, fileType: string) {
    console.log("--- importExpenses Request ---", { fileType });
    const { userId } = await getUserIdOrThrow();
    const base64Data = fileContent.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    let rows: any[];
  
    try {
      if (fileType === "text/csv") {
        rows = Papa.parse(buffer.toString("utf-8"), {
          header: true,
          skipEmptyLines: true,
        }).data;
      } else if (
        fileType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileType === "application/vnd.ms-excel"
      ) {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        console.error("Unsupported file type:", fileType);
        return { success: false, error: "Tipe file tidak didukung.", count: 0 };
      }
  
      if (!rows || rows.length === 0) {
        console.error("Empty or invalid file");
        return { success: false, error: "File kosong atau tidak ada data.", count: 0 };
      }
  
      const expensesToInsert = rows.map(row => {
        const amount = parseFloat(row.amount);
        const categoryId = parseInt(row.categoryId, 10);
        const date = new Date(row.date).toISOString().split("T")[0];

        if (isNaN(amount) || isNaN(categoryId) || !date) {
            console.warn("Melewati baris tidak valid:", row);
            return null;
        }

        return {
            userId: parseInt(userId),
            amount: amount.toString(),
            categoryId: categoryId,
            date: date,
            description: row.description ? String(row.description) : null,
        }
      }).filter(Boolean);

      if(expensesToInsert.length > 0) {
        await db.insert(expenses).values(expensesToInsert.filter(Boolean) as any);
      }
  
      revalidatePath("/dashboard");
      const response = { success: true, count: expensesToInsert.length, error: null };
      console.log("--- importExpenses Response ---", response);
      return response;
    } catch (error) {
      console.error("Database Error:", error);
      return {
        success: false,
        error: "Gagal mengimpor. Harap periksa format file.",
        count: 0,
      };
    }
  }
  