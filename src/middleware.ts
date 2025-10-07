import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "password",
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("token")?.value;

  const publicPaths = ["/login", "/register"];

  if (publicPaths.includes(pathname)) {
    if (tokenCookie) {
      try {
        await jwtVerify(tokenCookie, JWT_SECRET);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (error) {}
    }
    return NextResponse.next();
  }

  if (!tokenCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(tokenCookie, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path, kecuali untuk:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
