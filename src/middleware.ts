import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Middleware to handle authentication token validation
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl.clone();

  // Check authentication for all /dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Restrict /dashboard/projects, /dashboard/teams, /dashboard/users to company users only
    if (
      (url.pathname.startsWith("/dashboard/projects") ||
        url.pathname.startsWith("/dashboard/teams") ||
        url.pathname.startsWith("/dashboard/users")) &&
      token.accountType !== "company"
    ) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Restrict /dashboard/manager/** to company managers only
    if (
      url.pathname.startsWith("/dashboard/manager") &&
      (token.accountType !== "user" || token.role !== "Project Manager")
    ) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
