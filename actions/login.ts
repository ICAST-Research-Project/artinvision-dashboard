"use server";

import { LoginSchema } from "@/schemas";
import * as z from "zod";
import bcryptjs from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export type LoginResult =
  | { needsVerification: true; message: string }
  | { needsVerification: false; message: string };

export const login = async (
  values: z.infer<typeof LoginSchema>
): Promise<LoginResult> => {
  const parsed = LoginSchema.safeParse(values);
  if (!parsed.success) {
    return { needsVerification: false, message: "Invalid fields!" };
  }
  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return { needsVerification: false, message: "Invalid email or password" };
  }

  const isValid = await bcryptjs.compare(password, user.password);
  if (!isValid) {
    return { needsVerification: false, message: "Invalid email or password" };
  }

  if (!user.emailVerified) {
    const { email: tokenEmail, token } = await generateVerificationToken(
      user.email
    );
    await sendVerificationEmail(tokenEmail, token);
    return {
      needsVerification: true,
      message: "New confirmation link has been sent.",
    };
  }

  return { needsVerification: false, message: "Credentials verified" };
};
