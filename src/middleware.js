import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token") || ""; // Get token from cookies
  const path = request.nextUrl.pathname;

  // Protected routes (only for logged-in users)
  const protectedRoutes = ["/dashboard", "/dashboard/my-courses", "/courses/checkout"];

  // Auth routes (should NOT be accessible by logged-in users)
  const authRoutes = ["/auth/login", "/auth/signup"];

  // If user is NOT logged in & tries to access protected pages -> Redirect to login
  if (protectedRoutes.some(route => path.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // If user is logged in & tries to access auth pages -> Redirect to home
  if (authRoutes.includes(path)) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware to relevant routes
export const config = {
  matcher: ["/dashboard/:path*", "/courses/checkout", "/auth/login", "/auth/signup"],
};
