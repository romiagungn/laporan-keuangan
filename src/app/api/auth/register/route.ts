import { db } from "@/lib/db";
import { users, families } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  family: z
    .string()
    .min(3, { message: "Family name must be at least 3 characters." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = UserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, password, family: familyName } = validation.data;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 },
      );
    }

    const newUserId = await db.transaction(async (tx) => {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const newUserResult = await tx
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning({ id: users.id });

      const createdUser = newUserResult[0];
      if (!createdUser) {
        tx.rollback();
        throw new Error("Failed to create user.");
      }

      // 2. Cari atau buat keluarga
      let familyId: number;
      const existingFamily = await tx.query.families.findFirst({
        where: eq(families.name, familyName),
      });

      if (existingFamily) {
        familyId = existingFamily.id;
      } else {
        const newFamilyResult = await tx
          .insert(families)
          .values({
            name: familyName,
            ownerId: createdUser.id, // Set ownerId
          })
          .returning({ id: families.id });

        const newFamily = newFamilyResult[0];
        if (!newFamily) {
          tx.rollback();
          throw new Error("Failed to create family.");
        }
        familyId = newFamily.id;
      }

      await tx
        .update(users)
        .set({ familyId: familyId })
        .where(eq(users.id, createdUser.id));

      return createdUser.id;
    });

    return NextResponse.json(
      {
        message: "User and family association created successfully.",
        userId: newUserId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 },
    );
  }
}
