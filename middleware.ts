// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const apiAuthPrefix = "/api/auth";
const publicRoutes = ["/", "/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // allow these APIs outright
  if (
    pathname.startsWith("/api/s3/") ||
    pathname === "/api/museums" ||
    pathname.startsWith("/api/museums/")
  ) {
    return NextResponse.next();
  }

  // skip NextAuth API & static/file requests
  if (
    pathname.startsWith(apiAuthPrefix) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    /\.[\w]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const isAuthPage = pathname.startsWith("/auth/");
  const isPublic = publicRoutes.includes(pathname);

  // 🔴 If the user is already logged in and is on an auth page, push them away.
  if (isAuthPage && isLoggedIn) {
    const paramNext = nextUrl.searchParams.get("next");
    // sensible role-based default
    const byRole =
      (token?.accountType === "ARTIST" && "/artist") ||
      (token?.accountType === "CURATOR" && "/curator") ||
      (token?.accountType === "MUSEUM_ADMIN" && "/museum") ||
      "/";
    return NextResponse.redirect(new URL(paramNext || byRole, nextUrl));
  }

  // public and auth pages are allowed through
  if (isPublic || isAuthPage) {
    return NextResponse.next();
  }

  // everything else requires auth
  if (!isLoggedIn) {
    const url = new URL("/auth/login", nextUrl);
    url.searchParams.set("next", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // role gates
  const role = token?.accountType as
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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|public).*)"],
};
