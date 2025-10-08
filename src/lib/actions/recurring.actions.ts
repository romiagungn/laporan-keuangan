"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { recurringTransactions, incomes, expenses } from "../schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getFamilyUserIdsOrThrow } from "./family.actions";

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const RecurringTransactionSchema = z.object({
  id: z.coerce.number(),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  source: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.date(),
});

const CreateRecurringTransaction = RecurringTransactionSchema.omit({
  id: true,
});

export async function createRecurringTransaction(
  prevState: any,
  formData: FormData,
) {
  console.log("--- createRecurringTransaction Request ---", formData);
  try {
    const session = await getUserIdOrThrow();
    const { userId } = session;

    const validatedFields = CreateRecurringTransaction.safeParse({
      type: formData.get("type"),
      amount: formData.get("amount"),
      description: formData.get("description"),
      categoryId: formData.get("categoryId"),
      source: formData.get("source"),
      frequency: formData.get("frequency"),
      startDate: new Date(formData.get("startDate") as string),
    });

    if (!validatedFields.success) {
      console.error(
        "Validation Error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Membuat Transaksi Berulang.",
        success: false,
      };
    }

    const {
      type,
      amount,
      description,
      categoryId,
      source,
      frequency,
      startDate,
    } = validatedFields.data;

    if (type === "expense" && !categoryId) {
      return { message: "Kategori diperlukan untuk pengeluaran berulang." };
    }
    if (type === "income" && !source) {
      return { message: "Sumber diperlukan untuk pemasukan berulang." };
    }

    await db.insert(recurringTransactions).values({
      userId: parseInt(userId),
      type,
      amount: amount.toString(),
      description,
      categoryId,
      source,
      frequency,
      startDate: startDate.toISOString().split("T")[0],
      nextDate: startDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Membuat Transaksi Berulang.",
      success: false,
    };
  }

  revalidatePath("/recurring");
  const response = {
    message: "Transaksi Berulang berhasil disimpan.",
    success: true,
  };
  console.log("--- createRecurringTransaction Response ---", response);
  return response;
}

export async function getRecurringTransactions() {
  console.log("--- getRecurringTransactions Request ---");
  try {
    const userIds = await getFamilyUserIdsOrThrow();
    const transactions = await db.query.recurringTransactions.findMany({
      where: inArray(recurringTransactions.userId, userIds),
      orderBy: [desc(recurringTransactions.startDate)],
    });
    const response = transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      startDate: tx.startDate ? new Date(tx.startDate).toISOString() : "",
      nextDate: tx.nextDate ? new Date(tx.nextDate).toISOString() : "",
      endDate: tx.endDate ? new Date(tx.endDate).toISOString() : null,
      createdAt: tx.createdAt.toISOString(),
    }));
    console.log("--- getRecurringTransactions Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data transaksi berulang.");
  }
}

export async function deleteRecurringTransaction(id: number) {
  console.log("--- deleteRecurringTransaction Request ---", { id });
  try {
    const { userId } = await getUserIdOrThrow();
    await db
      .delete(recurringTransactions)
      .where(
        and(
          eq(recurringTransactions.id, id),
          eq(recurringTransactions.userId, parseInt(userId)),
        ),
      );
    revalidatePath("/recurring");
    const response = {
      success: true,
      message: "Transaksi berulang berhasil dihapus.",
    };
    console.log("--- deleteRecurringTransaction Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Gagal menghapus transaksi berulang.",
    };
  }
}

export async function processRecurringTransactions() {
  console.log("--- processRecurringTransactions Request ---");
  try {
    const userIds = await getFamilyUserIdsOrThrow();

    const today = new Date().toISOString().split("T")[0];

    const dueTransactions = await db.query.recurringTransactions.findMany({
      where: and(
        inArray(recurringTransactions.userId, userIds),
        sql`${recurringTransactions.nextDate} <= ${today}`,
      ),
    });

    if (dueTransactions.length === 0) {
      const response = {
        success: true,
        message: "Tidak ada transaksi berulang yang perlu diproses.",
      };
      console.log("--- processRecurringTransactions Response ---", response);
      return response;
    }

    let processedCount = 0;
    for (const tx of dueTransactions) {
      // Create income or expense
      if (tx.type === "income") {
        await db.insert(incomes).values({
          userId: tx.userId,
          amount: tx.amount,
          source: tx.source || "Recurring",
          date: tx.nextDate,
          description: tx.description || "Recurring Income",
        });
      } else if (tx.type === "expense" && tx.categoryId) {
        await db.insert(expenses).values({
          userId: tx.userId,
          amount: tx.amount,
          categoryId: tx.categoryId,
          date: tx.nextDate,
          description: tx.description || "Recurring Expense",
        });
      }

      // Calculate next date
      const nextDate = new Date(tx.nextDate);
      if (tx.frequency === "daily") nextDate.setDate(nextDate.getDate() + 1);
      if (tx.frequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
      if (tx.frequency === "monthly")
        nextDate.setMonth(nextDate.getMonth() + 1);
      if (tx.frequency === "yearly")
        nextDate.setFullYear(nextDate.getFullYear() + 1);

      // Update the recurring transaction with the new nextDate
      await db
        .update(recurringTransactions)
        .set({ nextDate: nextDate.toISOString().split("T")[0] })
        .where(eq(recurringTransactions.id, tx.id));

      processedCount++;
    }

    revalidatePath("/recurring");
    revalidatePath("/dashboard");
    revalidatePath("/incomes");
    const response = {
      success: true,
      message: `${processedCount} transaksi berhasil diproses.`,
    };
    console.log("--- processRecurringTransactions Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Gagal memproses transaksi berulang.",
    };
  }
}
