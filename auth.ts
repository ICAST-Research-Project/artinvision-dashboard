/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
// import NextAuth from "next-auth";
// import authConfig from "./auth.config";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "./lib/db";
// import { getUserById } from "./data/user";
// import { AccountType } from "@prisma/client";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   trustHost: process.env.AUTH_TRUST_HOST === "true",
//   callbacks: {
//     async session({ token, session }) {
//       if (token.sub && session.user) {
//         session.user.id = token.sub;
//       }
//       if (token.accountType && session.user) {
//         session.user.accountType = token.accountType as AccountType;
//       }
//       if (session.user) {
//         session.user.name = token.name;
//         session.user.email = token.email ?? "";
//       }
//       return session;
//     },
//     async jwt({ token }) {
//       if (!token.sub) return token;
//       const existingUser = await getUserById(token.sub);
//       if (!existingUser) return token;

//       token.name = existingUser.name;
//       token.email = existingUser.email;
//       token.accountType = existingUser.accountType; // <- required for middleware
//       return token;
//     },
//   },
//   adapter: PrismaAdapter(db),
//   session: { strategy: "jwt" },
//   ...authConfig,
// });

// auth.ts
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import authConfig from "./auth.config";

// ----- Edge-safe base config (NO Prisma/db imports here) -----
const base: NextAuthConfig = {
  ...authConfig,
  session: { strategy: "jwt" },
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  callbacks: {
    async session({ token, session }) {
      if (token?.sub && session.user) (session.user as any).id = token.sub;
      if (token?.accountType && session.user)
        (session.user as any).accountType = (token as any).accountType;
      if (session.user) {
        session.user.name = token?.name as any;
        session.user.email = (token?.email as any) ?? "";
      }
      return session;
    },
    // Edge version: keep simple; no DB here
    async jwt({ token }) {
      return token;
    },
  },
  // If you want logging, use v5 signatures. Otherwise omit logger entirely.
  // logger: {
  //   error(error) { console.error("[AUTH ERROR]", error); },
  //   warn(code) { console.warn("[AUTH WARN]", code); },
  //   debug(message, ...meta) {
  //     if (process.env.NODE_ENV !== "production") console.debug("[AUTH DEBUG]", message, ...meta);
  //   },
  // },
};

// 1) Edge-safe export for middleware (no adapter)
export const { auth } = NextAuth({
  ...base,
});

// 2) Node-only exports for routes/pages (WITH Prisma adapter + DB lookups)
function getNodeAdapter() {
  // lazy require so Prisma isn't bundled into the edge export above
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaAdapter } = require("@auth/prisma-adapter");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { db } = require("./lib/db");
  return PrismaAdapter(db);
}

async function nodeJwtCallback({ token }: any) {
  if (!token?.sub) return token;
  // lazy require to keep edge clean
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getUserById } = require("./data/user");
  const existingUser = await getUserById(token.sub);
  if (!existingUser) return token;

  token.name = existingUser.name;
  token.email = existingUser.email;
  (token as any).accountType = existingUser.accountType;
  return token;
}

export const { handlers, signIn, signOut } = NextAuth({
  ...base,
  adapter: getNodeAdapter(),
  callbacks: {
    ...base.callbacks!,
    jwt: nodeJwtCallback,
  },
});
