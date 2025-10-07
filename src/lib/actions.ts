"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { Expense } from "@/lib/definitions";
import { getUserSession } from "@/lib/session";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { db } from "@vercel/postgres";

export type State = {
  errors?: {
    amount?: string[];
    category?: string[];
    payment_method?: string[];
    date?: string[];
    description?: string[];
  };
  message: string | null;
};

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const ExpenseSchema = z.object({
  id: z.coerce.number(),
  amount: z.string().min(1, { message: "Please enter an amount." }),
  category: z.string().min(1, { message: "Please select a category." }),
  payment_method: z
    .string()
    .min(1, { message: "Please select a payment method." }),
  date: z.date().refine((val) => val instanceof Date && !isNaN(val.getTime()), {
    message: "Please select a valid date.",
  }),
  description: z.string().optional(),
});

const CreateExpense = ExpenseSchema.omit({ id: true });
const UpdateExpense = ExpenseSchema;
// =================================================================
// CRUD ACTIONS
// =================================================================

export async function createExpense(prevState: any, formData: FormData) {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: created_by } = session;

    const validatedFields = CreateExpense.safeParse({
      amount: formData.get("amount"),
      category: formData.get("category"),
      payment_method: formData.get("payment_method"),
      date: new Date(formData.get("date") as string),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message:
          "Gagal Menambah Pengeluaran. Harap periksa kembali isian Anda.",
      };
    }

    const { amount, category, payment_method, date, description } =
      validatedFields.data;
    const dateString = date.toISOString().split("T")[0];

    await db.query(
      `
      INSERT INTO expenses (user_id, amount, category, payment_method, date, description, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        userId,
        amount,
        category,
        payment_method,
        dateString,
        description,
        created_by,
      ],
    );
  } catch (error) {
    return { message: "Database Error: Gagal Menambah Pengeluaran." };
  }

  revalidatePath("/dashboard");
  return { message: "Pengeluaran berhasil ditambahkan.", success: true };
}

export async function updateExpense(
  id: number,
  prevState: any,
  formData: FormData,
) {
  try {
    const session = await getUserIdOrThrow();
    const { userId } = session;

    const validatedFields = UpdateExpense.safeParse({
      amount: formData.get("amount"),
      category: formData.get("category"),
      payment_method: formData.get("payment_method"),
      date: new Date(formData.get("date") as string),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Memperbarui Pengeluaran.",
      };
    }
    const { amount, category, payment_method, date, description } =
      validatedFields.data;
    const dateString = date.toISOString().split("T")[0];

    await db.query(
      `
      UPDATE expenses
      SET amount = $1, category = $2, payment_method = $3, date = $4, description = $5
      WHERE id = $6 AND user_id = $7
    `,
      [amount, category, payment_method, dateString, description, id, userId],
    );
  } catch (error) {
    return { message: "Database Error: Gagal Memperbarui Pengeluaran." };
  }

  revalidatePath("/dashboard");
  return { message: "Pengeluaran berhasil diperbarui.", success: true };
}

export async function deleteExpense(id: number) {
  try {
    const { userId } = await getUserIdOrThrow();
    await db.query(`DELETE FROM expenses WHERE id = $1 AND user_id = $2`, [
      id,
      userId,
    ]);
    revalidatePath("/dashboard");
    return { success: true, message: "Pengeluaran berhasil dihapus." };
  } catch (error) {
    return {
      success: false,
      message: "Database Error: Gagal menghapus pengeluaran.",
    };
  }
}

// =================================================================
// DATA FETCHING ACTIONS
// =================================================================

interface Filters {
  from?: string;
  to?: string;
  category?: string;
  payment_method?: string;
}

export async function fetchDashboardSummary() {
  const session = await getUserIdOrThrow();
  const { userId, name: created_by } = session;
  try {
    const todayPromise = db.query(
      `SELECT SUM(amount) FROM expenses WHERE user_id = $1 AND date = CURRENT_DATE`,
      [userId],
    );
    const thisWeekPromise = db.query(
      `SELECT SUM(amount) FROM expenses WHERE user_id = $1 AND date >= DATE_TRUNC('week', CURRENT_DATE)`,
      [userId],
    );
    const thisMonthPromise = db.query(
      `SELECT SUM(amount), COUNT(*) FROM expenses WHERE user_id = $1 AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId],
    );

    const [todayResult, thisWeekResult, thisMonthResult] = await Promise.all([
      todayPromise,
      thisWeekPromise,
      thisMonthPromise,
    ]);

    const todayTotal = Number(todayResult.rows[0].sum) || 0;
    const thisWeekTotal = Number(thisWeekResult.rows[0].sum) || 0;
    const thisMonthTotal = Number(thisMonthResult.rows[0].sum) || 0;
    const thisMonthCount = Number(thisMonthResult.rows[0].count) || 0;

    return {
      todayTotal,
      thisWeekTotal,
      thisMonthTotal,
      thisMonthCount,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch dashboard summary.");
  }
}

export async function fetchFilteredExpenses(
  filters: Filters,
): Promise<Expense[]> {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: created_by } = session;
    let query = `SELECT * FROM expenses WHERE user_id = $1`;
    const params: (string | number)[] = [userId];

    if (filters.from) {
      params.push(filters.from);
      query += ` AND date >= $${params.length}`;
    }
    if (filters.to) {
      params.push(filters.to);
      query += ` AND date <= $${params.length}`;
    }
    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }
    if (filters.payment_method) {
      params.push(filters.payment_method);
      query += ` AND payment_method = $${params.length}`;
    }

    query += ` ORDER BY date DESC, created_at DESC LIMIT 100`;

    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengeluaran.");
  }
}

export async function fetchSummaryStatistics(filters: Filters) {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: created_by } = session;

    let baseQuery = `SELECT SUM(amount) as total FROM expenses WHERE user_id = $1`;
    const params: (string | number)[] = [userId];

    if (filters.from) {
      params.push(filters.from);
      baseQuery += ` AND date >= $${params.length}`;
    }
    if (filters.to) {
      params.push(filters.to);
      baseQuery += ` AND date <= $${params.length}`;
    }
    if (filters.category) {
      params.push(filters.category);
      baseQuery += ` AND category = $${params.length}`;
    }
    if (filters.payment_method) {
      params.push(filters.payment_method);
      baseQuery += ` AND payment_method = $${params.length}`;
    }

    const { rows } = await db.query(baseQuery, params);

    return {
      total: Number(rows[0]?.total) || 0,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil statistik ringkasan.");
  }
}

export async function fetchExpensesByCategory(filters: Filters) {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: created_by } = session;
    let query = `SELECT category, SUM(amount) as total FROM expenses WHERE user_id = $1`;
    const params: (string | number)[] = [userId];

    if (filters.from) {
      params.push(filters.from);
      query += ` AND date >= $${params.length}`;
    }
    if (filters.to) {
      params.push(filters.to);
      query += ` AND date <= $${params.length}`;
    }
    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }
    if (filters.payment_method) {
      params.push(filters.payment_method);
      query += ` AND payment_method = $${params.length}`;
    }

    query += ` GROUP BY category ORDER BY total DESC`;

    const { rows } = await db.query(query, params);
    return rows.map((row) => ({
      category: row.category as string,
      total: Number(row.total),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengeluaran per kategori.");
  }
}

export async function getUniqueCategories() {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: created_by } = session;
    const { rows } = await db.query(
      `SELECT DISTINCT category FROM expenses WHERE user_id = $1 ORDER BY category`,
      [userId],
    );
    return rows.map((row) => row.category as string);
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export type TimeRange = "harian" | "mingguan" | "bulanan" | "tahunan";

export async function getChartData(timeRange: TimeRange) {
  const now = new Date();
  let fromDate, toDate: Date;

  switch (timeRange) {
    case "harian":
      fromDate = new Date(now.setHours(0, 0, 0, 0));
      toDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "mingguan":
      const firstDayOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay()),
      );
      firstDayOfWeek.setHours(0, 0, 0, 0);
      fromDate = firstDayOfWeek;
      toDate = new Date(firstDayOfWeek);
      toDate.setDate(toDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "bulanan":
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;
    case "tahunan":
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
  }

  return fetchExpensesByCategory({
    from: fromDate.toISOString().split("T")[0],
    to: toDate.toISOString().split("T")[0],
  });
}

export async function getSpendingInsight(timeRange: TimeRange) {
  const now = new Date();
  let fromDate, toDate, prevFromDate, prevToDate: Date;

  switch (timeRange) {
    case "harian":
      fromDate = new Date(now.setHours(0, 0, 0, 0));
      toDate = new Date(now.setHours(23, 59, 59, 999));
      prevFromDate = new Date(new Date().setDate(now.getDate() - 1));
      prevFromDate.setHours(0, 0, 0, 0);
      prevToDate = new Date(new Date().setDate(now.getDate() - 1));
      prevToDate.setHours(23, 59, 59, 999);
      break;
    case "mingguan":
      const firstDayOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay()),
      );
      firstDayOfWeek.setHours(0, 0, 0, 0);
      fromDate = firstDayOfWeek;
      toDate = new Date(firstDayOfWeek);
      toDate.setDate(toDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);

      prevFromDate = new Date(firstDayOfWeek);
      prevFromDate.setDate(prevFromDate.getDate() - 7);
      prevToDate = new Date(firstDayOfWeek);
      prevToDate.setDate(prevToDate.getDate() - 1);
      prevToDate.setHours(23, 59, 59, 999);
      break;
    case "bulanan":
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      prevFromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevToDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      break;
    case "tahunan":
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      prevFromDate = new Date(now.getFullYear() - 1, 0, 1);
      prevToDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
  }

  const [currentPeriodStats, previousPeriodStats, topCategoryData] =
    await Promise.all([
      fetchSummaryStatistics({
        from: fromDate.toISOString().split("T")[0],
        to: toDate.toISOString().split("T")[0],
      }),
      fetchSummaryStatistics({
        from: prevFromDate.toISOString().split("T")[0],
        to: prevToDate.toISOString().split("T")[0],
      }),
      fetchExpensesByCategory({
        from: fromDate.toISOString().split("T")[0],
        to: toDate.toISOString().split("T")[0],
      }),
    ]);

  const { total: currentTotal } = currentPeriodStats;
  const { total: previousTotal } = previousPeriodStats;

  let percentageChange = 0;
  if (previousTotal > 0) {
    percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  } else if (currentTotal > 0) {
    percentageChange = 100; // If previous was 0 and current is > 0, it's a 100% increase
  }

  const topCategory =
    topCategoryData.length > 0 ? topCategoryData[0].category : null;

  return {
    percentageChange: Math.round(percentageChange),
    topCategory,
    currentTotal,
  };
}

// =================================================================
// BULK & OTHER ACTIONS
// =================================================================

export async function fetchAllExpenses(): Promise<
  Omit<Expense, "user_id" | "created_at">[]
> {
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: created_by } = session;
    const { rows } = await db.query(
      `
      SELECT id, date, category, amount, payment_method, description
      FROM expenses
      WHERE user_id = $1
      ORDER BY date DESC
    `,
      [userId],
    );
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil semua data pengeluaran untuk ekspor.");
  }
}

export async function importExpenses(fileContent: string, fileType: string) {
  const session = await getUserIdOrThrow();
  const { userId, name: created_by } = session;
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
      return { success: false, error: "Tipe file tidak didukung." };
    }

    if (!rows || rows.length === 0) {
      return { success: false, error: "File kosong atau tidak ada data." };
    }

    const client = await db.connect();
    let importedCount = 0;

    await client.query("BEGIN");
    try {
      for (const row of rows) {
        const expenseToInsert = {
          amount: parseFloat(row.amount),
          category: String(row.category),
          payment_method: String(row.payment_method),
          date: new Date(row.date).toISOString().split("T")[0],
          description: row.description ? String(row.description) : null,
        };

        if (
          !expenseToInsert.amount ||
          isNaN(expenseToInsert.amount) ||
          !expenseToInsert.category ||
          !expenseToInsert.payment_method ||
          !expenseToInsert.date
        ) {
          console.warn("Melewati baris tidak valid:", row);
          continue;
        }

        await client.query(
          `INSERT INTO expenses (user_id, date, category, amount, payment_method, description) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            expenseToInsert.date,
            expenseToInsert.category,
            expenseToInsert.amount,
            expenseToInsert.payment_method,
            expenseToInsert.description,
          ],
        );
        importedCount++;
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Transaction Error:", e);
      throw e;
    } finally {
      client.release();
    }

    revalidatePath("/dashboard");
    return { success: true, count: importedCount };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      error: "Gagal mengimpor. Harap periksa format file.",
    };
  }
}
