"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { Expense } from "@/lib/definitions";
import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { expenses, categories } from "../schema";
import { eq, and, desc, gte, lte, sum, getTableColumns, inArray } from "drizzle-orm";
import { getFamilyUserIdsOrThrow } from "./family.actions";

// type State = {
//   errors?: {
//     amount?: string[];
//     category?: string[];
//     payment_method?: string[];
//     date?: string[];
//     description?: string[];
//   };
//   message: string | null;
// };

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const ExpenseSchema = z.object({
  id: z.coerce.number(),
  amount: z.coerce.number().positive(),
  categoryId: z.coerce.number().positive(),
  payment_method: z.string(),
  date: z.date(),
  description: z.string().optional(),
});

const CreateExpense = ExpenseSchema.omit({ id: true });
const UpdateExpense = ExpenseSchema;

export async function createExpense(prevState: any, formData: FormData) {
  console.log("--- createExpense Request ---", formData);
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: userName } = session;

    const validatedFields = CreateExpense.safeParse({
      amount: formData.get("amount"),
      categoryId: formData.get("categoryId"),
      payment_method: formData.get("payment_method"),
      date: new Date(formData.get("date") as string),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      console.error(
        "Validation Error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message:
          "Gagal Menambah Pengeluaran. Harap periksa kembali isian Anda.",
      };
    }

    const { amount, categoryId, payment_method, date, description } =
      validatedFields.data;
    const dateString = date.toISOString().split("T")[0];

    await db.insert(expenses).values({
      userId: parseInt(userId),
      amount: amount.toString(),
      categoryId: categoryId,
      paymentMethod: payment_method,
      date: dateString,
      description: description,
      createdBy: userName,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Gagal Menambah Pengeluaran." };
  }

  revalidatePath("/dashboard");
  const response = { message: "Pengeluaran berhasil ditambahkan.", success: true };
  console.log("--- createExpense Response ---", response);
  return response;
}

export async function updateExpense(
  id: number,
  prevState: any,
  formData: FormData,
) {
  console.log("--- updateExpense Request ---", { id, formData });
  try {
    const { userId } = await getUserIdOrThrow();

    const validatedFields = UpdateExpense.safeParse({
      id: id,
      amount: formData.get("amount"),
      categoryId: formData.get("categoryId"),
      payment_method: formData.get("payment_method"),
      date: new Date(formData.get("date") as string),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      console.error(
        "Validation Error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Memperbarui Pengeluaran.",
      };
    }
    const { amount, categoryId, payment_method, date, description } =
      validatedFields.data;
    const dateString = date.toISOString().split("T")[0];

    await db
      .update(expenses)
      .set({
        amount: amount.toString(),
        categoryId: categoryId,
        paymentMethod: payment_method,
        date: dateString,
        description: description,
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, parseInt(userId))));
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Gagal Memperbarui Pengeluaran." };
  }

  revalidatePath("/dashboard");
  const response = { message: "Pengeluaran berhasil diperbarui.", success: true };
  console.log("--- updateExpense Response ---", response);
  return response;
}

export async function deleteExpense(id: number) {
  console.log("--- deleteExpense Request ---", { id });
  try {
    const { userId } = await getUserIdOrThrow();
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, parseInt(userId))));
    revalidatePath("/dashboard");
    const response = { success: true, message: "Pengeluaran berhasil dihapus." };
    console.log("--- deleteExpense Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error)
    return {
      success: false,
      message: "Database Error: Gagal menghapus pengeluaran.",
    };
  }
}

interface Filters {
  from?: string;
  to?: string;
  categoryId?: number;
}



export async function fetchFilteredExpenses(
  filters: Filters,
): Promise<Expense[]> {
  console.log("--- fetchFilteredExpenses Request ---", filters);
  try {
    const userIds = await getFamilyUserIdsOrThrow();

    const conditions = [inArray(expenses.userId, userIds)];
    if (filters.from) {
      conditions.push(gte(expenses.date, filters.from));
    }
    if (filters.to) {
      conditions.push(lte(expenses.date, filters.to));
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      conditions.push(inArray(expenses.categoryId, filters.categoryIds));
    }

    const result = await db
      .select({
        ...getTableColumns(expenses),
        categoryName: categories.name,
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(expenses.date), desc(expenses.createdAt))
      .limit(100);

    const response = result.map((r) => ({
      id: r.id,
      user_id: r.userId.toString(),
      date: r.date,
      category: r.categoryName || "Uncategorized",
      payment_method: r.paymentMethod,
      description: r.description,
      amount: Number(r.amount),
      created_at: r.createdAt.toISOString(),
      created_by: r.createdBy,
    })) as Expense[];
    console.log("--- fetchFilteredExpenses Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengeluaran.");
  }
}

export async function fetchSummaryStatistics(filters: Filters) {
  console.log("--- fetchSummaryStatistics Request ---", filters);
  try {
    const userIds = await getFamilyUserIdsOrThrow();

    const conditions = [inArray(expenses.userId, userIds)];
    if (filters.from) {
      conditions.push(gte(expenses.date, filters.from));
    }
    if (filters.to) {
      conditions.push(lte(expenses.date, filters.to));
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        conditions.push(inArray(expenses.categoryId, filters.categoryIds));
    }

    const result = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(and(...conditions));

    const response = {
      total: Number(result[0]?.total) || 0,
    };
    console.log("--- fetchSummaryStatistics Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil statistik ringkasan.");
  }
}

interface Filters {
  from?: string;
  to?: string;
  categoryIds?: number[];
}

export async function fetchExpensesByCategory(filters: Filters) {
  console.log("--- fetchExpensesByCategory Request ---", filters);
  try {
    const userIds = await getFamilyUserIdsOrThrow();

    const conditions = [inArray(expenses.userId, userIds)];
    if (filters.from) {
      conditions.push(gte(expenses.date, filters.from));
    }
    if (filters.to) {
      conditions.push(lte(expenses.date, filters.to));
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        conditions.push(inArray(expenses.categoryId, filters.categoryIds));
    }

    const result = await db
      .select({
        category: categories.name,
        total: sum(expenses.amount),
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(categories.name)
      .orderBy(desc(sum(expenses.amount)));

    const response = result.map((row) => ({
      category: row.category as string,
      total: Number(row.total),
    }));
    console.log("--- fetchExpensesByCategory Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengeluaran per kategori.");
  }
}

