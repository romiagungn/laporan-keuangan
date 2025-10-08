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
  family: z.string().min(3, { message: "Family name must be at least 3 characters." }),
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

    const { name, email, password, family } = validation.data;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 },
      );
    }

    let familyId: number;
    const existingFamily = await db.query.families.findFirst({
      where: eq(families.name, family),
    });

    if (existingFamily) {
      familyId = existingFamily.id;
    } else {
      const newFamily = await db.insert(families).values({ name: family }).returning();
      familyId = newFamily[0].id;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      familyId,
    });

    return NextResponse.json(
      { message: "User created successfully." },
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
