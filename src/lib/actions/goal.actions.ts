"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { financialGoals } from "../schema";
import { eq } from "drizzle-orm";

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const FinancialGoalSchema = z.object({
  id: z.number(),
  name: z.string().min(3, { message: "Nama tujuan minimal 3 karakter." }),
  targetAmount: z.coerce
    .number()
    .positive({ message: "Jumlah target harus positif." }),
  currentAmount: z.coerce.number().optional(),
  targetDate: z.coerce.date().optional(),
});

const CreateFinancialGoal = FinancialGoalSchema.omit({ id: true });

export async function createFinancialGoal(prevState: any, formData: FormData) {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: userName } = session;

    const validatedFields = CreateFinancialGoal.safeParse({
      name: formData.get("name"),
      targetAmount: formData.get("targetAmount"),
      targetDate: formData.get("targetDate"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Membuat Tujuan. Harap periksa kembali isian Anda.",
        success: false,
      };
    }

    const { name, targetAmount, targetDate } = validatedFields.data;
    const formattedTargetDate = targetDate
      ? targetDate.toISOString().split("T")[0]
      : null;

    await db.insert(financialGoals).values({
      userId: parseInt(userId),
      name,
      targetAmount: targetAmount.toString(),
      targetDate: formattedTargetDate,
      createdBy: userName,
    });

    revalidatePath("/goals");
    return { message: "Tujuan berhasil dibuat.", success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Membuat Tujuan.",
      success: false,
    };
  }
}

export async function getFinancialGoals() {
  try {
    const { userId } = await getUserIdOrThrow();
    return await db
      .select()
      .from(financialGoals)
      .where(eq(financialGoals.userId, parseInt(userId)));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data tujuan keuangan.");
  }
}

const AddSavingsSchema = z.object({
  goalId: z.coerce.number(),
  amount: z.coerce.number().positive({ message: "Jumlah harus positif." }),
});

export async function addSavingsToGoal(prevState: any, formData: FormData) {
  try {
    const validatedFields = AddSavingsSchema.safeParse({
      goalId: formData.get("goalId"),
      amount: formData.get("amount"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Menambah Tabungan. Harap periksa kembali isian Anda.",
        success: false,
      };
    }

    const { goalId, amount } = validatedFields.data;

    const [goal] = await db
      .select()
      .from(financialGoals)
      .where(eq(financialGoals.id, goalId));

    if (!goal) {
      throw new Error("Tujuan tidak ditemukan.");
    }

    const newCurrentAmount = parseFloat(goal.currentAmount) + amount;

    await db
      .update(financialGoals)
      .set({ currentAmount: newCurrentAmount.toString() })
      .where(eq(financialGoals.id, goalId));

    revalidatePath("/goals");
    return { message: "Tabungan berhasil ditambahkan.", success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Menambah Tabungan.",
      success: false,
    };
  }
}
