import { NextResponse } from "next/server";
// import authConfig from "./auth.config";
// import NextAuth from "next-auth";
import { apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";

// const { auth } = NextAuth(authConfig);

import { auth } from "./auth";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthPage = authRoutes.includes(nextUrl.pathname);
  const isPublicPage = publicRoutes.includes(nextUrl.pathname);
  const isLoggedIn = Boolean(req.auth);

  if (isApiAuthRoute || isAuthPage || isPublicPage) {
    return NextResponse.next();
  }
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  const role = session?.user.accountType;

  if (nextUrl.pathname.startsWith("/curator") && role !== "CURATOR") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/museum") && role !== "MUSEUM_ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/artist") && role !== "ARTIST") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // if (isPublicPage || isAuthPage) {
  //   return NextResponse.next();
  // }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
