"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { budgets, categories, expenses } from "../schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { getFamilyUserIdsOrThrow } from "./family.actions";

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const BudgetSchema = z.object({
  id: z.coerce.number(),
  amount: z.coerce
    .number()
    .positive({ message: "Please enter a positive amount." }),
  categoryId: z.coerce
    .number()
    .min(1, { message: "Please select a category." }),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number(),
});

const CreateBudget = BudgetSchema.omit({ id: true });

export async function createBudget(prevState: any, formData: FormData) {
  console.log("--- createBudget Request ---", formData);
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: userName } = session;

    // Extract month and year from date string like "2024-07"
    const dateStr = formData.get("monthYear") as string;
    const [year, month] = dateStr.split("-").map(Number);

    const validatedFields = CreateBudget.safeParse({
      amount: formData.get("amount"),
      categoryId: formData.get("categoryId"),
      month: month,
      year: year,
    });

    if (!validatedFields.success) {
      console.error(
        "Validation Error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Membuat Anggaran. Harap periksa kembali isian Anda.",
        success: false,
      };
    }

    const { amount, categoryId, month: m, year: y } = validatedFields.data;

    await db
      .insert(budgets)
      .values({
        userId: parseInt(userId),
        amount: amount.toString(),
        categoryId: categoryId,
        month: m,
        year: y,
        createdBy: userName,
      })
      .onConflictDoUpdate({
        target: [
          budgets.userId,
          budgets.categoryId,
          budgets.year,
          budgets.month,
        ],
        set: { amount: amount.toString() },
      });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Membuat Anggaran.",
      success: false,
    };
  }

  revalidatePath("/budgets");
  const response = { message: "Anggaran berhasil disimpan.", success: true };
  console.log("--- createBudget Response ---", response);
  return response;
}

export async function getBudgetsWithProgress() {
  console.log("--- getBudgetsWithProgress Request ---");
  try {
    const userIds = await getFamilyUserIdsOrThrow();

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const userBudgets = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        categoryName: categories.name,
        categoryId: categories.id,
        month: budgets.month,
        year: budgets.year,
        spent: sql<number>`sum(${expenses.amount})`,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .leftJoin(
        expenses,
        and(
          eq(expenses.categoryId, budgets.categoryId),
          eq(sql`extract(month from ${expenses.date})`, budgets.month),
          eq(sql`extract(year from ${expenses.date})`, budgets.year),
        ),
      )
      .where(
        and(
          inArray(budgets.userId, userIds),
          eq(budgets.month, currentMonth),
          eq(budgets.year, currentYear),
        ),
      )
      .groupBy(budgets.id, categories.name, categories.id);

    const response = userBudgets.map((b) => ({
      ...b,
      spent: Number(b.spent) || 0,
    }));
    console.log("--- getBudgetsWithProgress Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data anggaran.");
  }
}

export async function deleteBudget(id: number) {
  console.log("--- deleteBudget Request ---", { id });
  try {
    const { userId } = await getUserIdOrThrow();
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, parseInt(userId))));
    revalidatePath("/budgets");
    const response = { success: true, message: "Anggaran berhasil dihapus." };
    console.log("--- deleteBudget Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Gagal menghapus anggaran.",
    };
  }
}
