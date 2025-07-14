import { AccountType } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  accountType: AccountType;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
