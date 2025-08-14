// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth";

// Inline these to avoid importing from "@/routes" (which may pull server-only deps)
const apiAuthPrefix = "/api/auth";
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  // add any other fully public pages here
];
const authRoutes = [
  "/auth/login",
  "/auth/register",
  // any routes that should remain accessible even when logged in
];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // --- Fast exits / allowlist for uploads & public APIs you mentioned ---
  if (
    pathname.startsWith("/api/s3/") ||
    pathname === "/api/museums" ||
    pathname.startsWith("/api/museums/")
  ) {
    return NextResponse.next();
  }

  // Never run auth logic for NextAuth’s own API routes
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Don’t guard Next.js internals or static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/) // file requests
  ) {
    return NextResponse.next();
  }

  const isPublic = publicRoutes.includes(pathname);
  const isAuthPage = authRoutes.includes(pathname);
  const isLoggedIn = !!req.auth;

  // Public pages are always allowed
  if (isPublic || isAuthPage) {
    return NextResponse.next();
  }

  // Require auth for everything else
  if (!isLoggedIn) {
    const url = new URL("/auth/login", nextUrl); // correct base for Edge
    url.searchParams.set("next", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Role-based gates (defensive: only read if present)
  const role = req.auth?.user?.accountType as
    | "CURATOR"
    | "MUSEUM_ADMIN"
    | "ARTIST"
    | undefined;

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
});

export const config = {
  // Keep this matcher tight. Avoid blanket-catching all API routes unless you must.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|public).*)"],
};
