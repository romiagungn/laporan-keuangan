import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import "server-only";

interface UserPayload {
  userId: string;
  name: string;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "password",
);

export async function getUserSession(): Promise<UserPayload | null> {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch (error) {
    console.error("Failed to verify token:", error);
    // Hapus cookie jika token tidak valid
    (await cookies()).delete("token");
    return null;
  }
}
