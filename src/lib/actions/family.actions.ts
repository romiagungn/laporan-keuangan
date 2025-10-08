"use server";

import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function getFamilyUserIdsOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, parseInt(session.userId)),
    columns: {
      familyId: true,
    },
  });

  if (!currentUser?.familyId) {
    return [parseInt(session.userId)];
  }

  const familyUsers = await db.query.users.findMany({
    where: eq(users.familyId, currentUser.familyId),
    columns: {
      id: true,
    },
  });

  return familyUsers.map((user) => user.id);
}
