"use server";

import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { families, users } from "../schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function getFamilyDetails() {
  const session = await getUserSession();
  if (!session?.userId) {
    return null;
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, parseInt(session.userId)),
    with: {
      family: {
        with: {
          users: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return currentUser?.family;
}

export async function createFamily(name: string) {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const userId = parseInt(session.userId);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { familyId: true },
  });

  if (user?.familyId) {
    throw new Error("Anda sudah tergabung dalam keluarga.");
  }

  const [newFamily] = await db
    .insert(families)
    .values({ name, ownerId: userId })
    .returning();

  await db
    .update(users)
    .set({ familyId: newFamily.id })
    .where(eq(users.id, userId));

  revalidatePath("/family");
  return newFamily;
}

export async function addMemberByEmail({
  email,
  familyId,
}: {
  email: string;
  familyId: number;
}) {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const ownerId = parseInt(session.userId);

  const family = await db.query.families.findFirst({
    where: and(eq(families.id, familyId), eq(families.ownerId, ownerId)),
  });

  if (!family) {
    throw new Error("Hanya pemilik yang dapat menambah anggota.");
  }

  const userToAdd = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.familyId)),
  });

  if (!userToAdd) {
    throw new Error(
      "Pengguna tidak ditemukan atau sudah tergabung dalam keluarga lain.",
    );
  }

  await db
    .update(users)
    .set({ familyId: familyId })
    .where(eq(users.id, userToAdd.id));

  revalidatePath("/family");
}

export async function removeMember({
  memberId,
  familyId,
}: {
  memberId: number;
  familyId: number;
}) {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const ownerId = parseInt(session.userId);

  if (ownerId === memberId) {
    throw new Error("Pemilik tidak dapat menghapus dirinya sendiri.");
  }

  const family = await db.query.families.findFirst({
    where: and(eq(families.id, familyId), eq(families.ownerId, ownerId)),
  });

  if (!family) {
    throw new Error("Hanya pemilik yang dapat menghapus anggota.");
  }

  await db
    .update(users)
    .set({ familyId: null })
    .where(and(eq(users.id, memberId), eq(users.familyId, familyId)));

  revalidatePath("/family");
}

export async function leaveFamily() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  const userId = parseInt(session.userId);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { familyId: true },
  });

  if (!user?.familyId) {
    throw new Error("Anda tidak tergabung dalam keluarga manapun.");
  }

  const family = await db.query.families.findFirst({
    where: eq(families.id, user.familyId),
    columns: { ownerId: true },
  });

  if (family?.ownerId === userId) {
    throw new Error(
      "Pemilik tidak bisa keluar. Transfer kepemilikan atau hapus keluarga.",
    );
  }

  await db.update(users).set({ familyId: null }).where(eq(users.id, userId));

  revalidatePath("/family");
}
