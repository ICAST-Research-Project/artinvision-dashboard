import { AccountType } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  accountType: AccountType;
};

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      accountType: AccountType;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accountType?: AccountType;
  }
}
