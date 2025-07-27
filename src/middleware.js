import { NextResponse } from "next/server";

export function middleware(request) {
  // Temporarily disable middleware-based authentication
  // and rely on client-side authentication checks
  // This is because Appwrite session cookies may not be accessible to middleware
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    const allCookies = request.cookies.getAll();
    console.log('Middleware - Path:', request.nextUrl.pathname);
    console.log('Middleware - All Cookies:', allCookies.map(c => `${c.name}=${c.value?.substring(0, 20)}...`));
  }
  
  // Allow all requests to pass through
  // Authentication will be handled by the AuthContext on the client side
  return NextResponse.next();
}

// Apply middleware to relevant routes
export const config = {
  matcher: ["/dashboard/:path*", "/courses/checkout", "/auth/login", "/auth/signup"],
};
