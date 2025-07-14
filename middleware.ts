import { NextResponse } from "next/server";
import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthPage = authRoutes.includes(nextUrl.pathname);
  const isPublicPage = publicRoutes.includes(nextUrl.pathname);
  const isLoggedIn = Boolean(req.auth);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }
  if (isPublicPage || isAuthPage) {
    return NextResponse.next();
  }
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
