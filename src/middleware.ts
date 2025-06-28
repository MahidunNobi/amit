// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  if (isAuthPage && token) {
    // Redirect logged-in users away from login page
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !isAuthPage) {
    // Redirect non-authenticated users to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply to all routes except static assets and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
