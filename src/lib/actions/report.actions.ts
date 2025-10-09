"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { customReports } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export async function getSavedReports() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const userId = parseInt(session.userId);

  const reports = await db.query.customReports.findMany({
    where: eq(customReports.userId, userId),
    orderBy: (customReports, { desc }) => [desc(customReports.createdAt)],
  });

  return reports;
}

export async function saveReport({
  name,
  filters,
}: {
  name: string;
  filters: { from?: string; to?: string; categoryIds?: number[] };
}) {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const userId = parseInt(session.userId);

  await db.insert(customReports).values({
    userId,
    name,
    filters,
  });

  revalidatePath("/reports");
}

export async function deleteSavedReport(id: number) {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const userId = parseInt(session.userId);

  await db
    .delete(customReports)
    .where(and(eq(customReports.id, id), eq(customReports.userId, userId)));

  revalidatePath("/reports");
}
