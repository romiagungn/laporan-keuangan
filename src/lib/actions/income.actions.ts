"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { incomes } from "../schema";
import { eq, and, desc } from "drizzle-orm";

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const IncomeSchema = z.object({
  id: z.coerce.number(),
  amount: z.string().min(1, { message: "Please enter an amount." }),
  source: z.string().min(1, { message: "Please enter a source." }),
  date: z.date().refine((val) => val instanceof Date && !isNaN(val.getTime()), {
    message: "Please select a valid date.",
  }),
  description: z.string().optional(),
});

const CreateIncome = IncomeSchema.omit({ id: true });

export async function createIncome(prevState: any, formData: FormData) {
  console.log("--- createIncome Request ---", formData);
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: userName } = session;

    const validatedFields = CreateIncome.safeParse({
      amount: formData.get("amount"),
      source: formData.get("source"),
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
        message: "Gagal Menambah Pemasukan. Harap periksa kembali isian Anda.",
        success: false,
      };
    }

    const { amount, source, date, description } = validatedFields.data;

    await db.insert(incomes).values({
      userId: parseInt(userId),
      amount: amount,
      source: source,
      date: date.toISOString().split("T")[0],
      description: description,
      createdBy: userName,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Menambah Pemasukan.",
      success: false,
    };
  }

  revalidatePath("/incomes");
  const response = {
    message: "Pemasukan berhasil ditambahkan.",
    success: true,
  };
  console.log("--- createIncome Response ---", response);
  return response;
}

export async function getIncomes() {
  console.log("--- getIncomes Request ---");
  try {
    const session = await getUserIdOrThrow();
    const { userId } = session;

    const userIncomes = await db.query.incomes.findMany({
      where: eq(incomes.userId, parseInt(userId)),
      orderBy: [desc(incomes.date)],
    });

    const response = userIncomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
      createdAt: income.createdAt.toISOString(),
    }));
    console.log("--- getIncomes Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pemasukan.");
  }
}

export async function deleteIncome(id: number) {
  console.log("--- deleteIncome Request ---", { id });
  try {
    const { userId } = await getUserIdOrThrow();
    await db
      .delete(incomes)
      .where(and(eq(incomes.id, id), eq(incomes.userId, parseInt(userId))));
    revalidatePath("/incomes");
    const response = { success: true, message: "Pemasukan berhasil dihapus." };
    console.log("--- deleteIncome Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Gagal menghapus pemasukan.",
    };
  }
}
