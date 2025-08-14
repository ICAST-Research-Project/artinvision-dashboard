// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Keep these here to avoid importing anything server-only
const apiAuthPrefix = "/api/auth";
const publicRoutes = ["/", "/auth/login", "/auth/register"];
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Allow-list specific APIs you mentioned
  if (
    pathname.startsWith("/api/s3/") ||
    pathname === "/api/museums" ||
    pathname.startsWith("/api/museums/")
  ) {
    return NextResponse.next();
  }

  // Skip NextAuth API & static assets & file requests
  if (
    pathname.startsWith(apiAuthPrefix) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    /\.[\w]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isPublic = publicRoutes.includes(pathname);
  const isAuthPage = authRoutes.includes(pathname);

  // Read the NextAuth JWT (Edge-safe)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  // Public or auth pages are always allowed
  if (isPublic || isAuthPage) {
    return NextResponse.next();
  }

  // Require auth for everything else
  if (!isLoggedIn) {
    const url = new URL("/auth/login", nextUrl);
    url.searchParams.set("next", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Role-based gating — token must include accountType (set in auth.ts callbacks)
  const role = token?.accountType as "CURATOR" | "MUSEUM_ADMIN" | "ARTIST" | undefined;

  if (pathname.startsWith("/curator") && role !== "CURATOR") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (pathname.startsWith("/museum") && role !== "MUSEUM_ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (pathname.startsWith("/artist") && role !== "ARTIST") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Keep this matcher tight; do not blanket-catch all API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|public).*)"],
};
