import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const apiAuthPrefix = "/api/auth";
const publicRoutes = ["/", "/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (
    pathname.startsWith("/api/s3/") ||
    pathname.startsWith("/api/profiles3") ||
    pathname === "/api/museums" ||
    pathname.startsWith("/api/museums/") ||
    pathname.startsWith("/api/collections/") ||
    pathname === "/api/collections"
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith(apiAuthPrefix) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    /\.[\w]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req });
  const isLoggedIn = !!token;
  const isAuthPage = pathname.startsWith("/auth/");
  const isPublic = publicRoutes.includes(pathname);

  if (isAuthPage && isLoggedIn) {
    const paramNext = nextUrl.searchParams.get("next");
    const byRole =
      (token?.accountType === "ARTIST" && "/artist") ||
      (token?.accountType === "CURATOR" && "/curator") ||
      (token?.accountType === "MUSEUM_ADMIN" && "/museum") ||
      "/";
    return NextResponse.redirect(new URL(paramNext || byRole, nextUrl));
  }

  if (isPublic || isAuthPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const url = new URL("/auth/login", nextUrl);
    url.searchParams.set("next", pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  const role = token?.accountType as "CURATOR" | "MUSEUM_ADMIN" | "ARTIST";
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
