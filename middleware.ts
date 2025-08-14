// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Keep simple constants inline to avoid server-only imports
const apiAuthPrefix = "/api/auth";
const publicRoutes = ["/", "/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // allow specific APIs you mentioned
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

  // 🔴 IMPORTANT: handle /auth/* BEFORE letting auth/public routes pass
  const isAuthPage = pathname.startsWith("/auth/");
  if (isAuthPage && isLoggedIn) {
    // honor ?next, else send by role
    const next = nextUrl.searchParams.get("next");
    const byRole =
      (token?.accountType === "ARTIST" && "/artist") ||
      (token?.accountType === "CURATOR" && "/curator") ||
      (token?.accountType === "MUSEUM_ADMIN" && "/museum") ||
      "/";

    return NextResponse.redirect(new URL(next || byRole, nextUrl));
  }

  // public pages always allowed
  const isPublic = publicRoutes.includes(pathname);
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
