"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserSession } from "@/lib/session";

async function getUserIdOrThrow() {
  const session = await getUserSession();
  if (!session?.userId) {
    throw new Error("Otentikasi diperlukan.");
  }
  return session;
}

const CategorySchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Nama kategori tidak boleh kosong."),
});

const CreateCategory = CategorySchema.omit({ id: true });
const UpdateCategory = CategorySchema;

export async function createCategory(prevState: any, formData: FormData) {
  console.log("--- createCategory Request ---", formData);
  try {
    const session = await getUserIdOrThrow();
    const { userId, name: userName } = session;

    const validatedFields = CreateCategory.safeParse({
      name: formData.get("name"),
    });

    if (!validatedFields.success) {
      console.error(
        "Validation Error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Menambah Kategori. Harap periksa kembali isian Anda.",
        success: false,
      };
    }

    const { name } = validatedFields.data;

    await db.insert(categories).values({
      userId: parseInt(userId),
      name: name,
      createdBy: userName,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Menambah Kategori.",
      success: false,
    };
  }

  revalidatePath("/categories");
  const response = { message: "Kategori berhasil ditambahkan.", success: true };
  console.log("--- createCategory Response ---", response);
  return response;
}

export async function updateCategory(
  id: number,
  prevState: any,
  formData: FormData,
) {
  console.log("--- updateCategory Request ---", { id, formData });
  try {
    const { userId } = await getUserIdOrThrow();

    const validatedFields = UpdateCategory.safeParse({
      id: id,
      name: formData.get("name"),
    });

    if (!validatedFields.success) {
      console.error(
        "Validation Error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Gagal Memperbarui Kategori.",
        success: false,
      };
    }

    const { name } = validatedFields.data;

    await db
      .update(categories)
      .set({ name: name })
      .where(
        and(eq(categories.id, id), eq(categories.userId, parseInt(userId))),
      );
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal Memperbarui Kategori.",
      success: false,
    };
  }

  revalidatePath("/categories");
  const response = { message: "Kategori berhasil diperbarui.", success: true };
  console.log("--- updateCategory Response ---", response);
  return response;
}

export async function deleteCategory(id: number) {
  console.log("--- deleteCategory Request ---", { id });
  try {
    const { userId } = await getUserIdOrThrow();
    await db
      .delete(categories)
      .where(
        and(eq(categories.id, id), eq(categories.userId, parseInt(userId))),
      );
    revalidatePath("/categories");
    const response = { success: true, message: "Kategori berhasil dihapus." };
    console.log("--- deleteCategory Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Gagal menghapus kategori.",
    };
  }
}

export async function getCategories() {
  console.log("--- getCategories Request ---");
  try {
    const { userId } = await getUserIdOrThrow();
    const response = await db.query.categories.findMany({
      where: eq(categories.userId, parseInt(userId)),
      orderBy: [desc(categories.name)],
    });
    console.log("--- getCategories Response ---", response);
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}
