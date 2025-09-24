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
import authConfig from "./auth.config";

// ⚠️ Do NOT import Prisma or DB at the top level in this file.
//    The edge export (used by middleware) must stay Node-free.

// ---- Shared base (edge-safe) ----
const base = {
  ...authConfig,
  session: { strategy: "jwt" as const },
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  callbacks: {
    async session({ token, session }: any) {
      if (token?.sub && session.user) session.user.id = token.sub;
      if (token?.accountType && session.user)
        (session.user as any).accountType = token.accountType;
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email ?? "";
      }
      return session;
    },
    // Edge-safe: no DB calls here
    async jwt({ token }: any) {
      return token;
    },
  },
};

// 1) Edge-safe export for middleware (NO adapter, NO DB)
export const { auth } = NextAuth({
  ...base,
});

// 2) Node-only exports for routes/pages (WITH Prisma adapter + DB lookups)
function getNodeAdapter() {
  // Lazy-require so it isn't bundled into the edge export above
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaAdapter } = require("@auth/prisma-adapter");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { db } = require("./lib/db");
  return PrismaAdapter(db);
}

// Node-only jwt that can hit the DB
async function nodeJwtCallback({ token }: any) {
  if (!token?.sub) return token;
  // Lazy-require to keep edge bundle clean
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
    ...base.callbacks,
    jwt: nodeJwtCallback,
  },
});
