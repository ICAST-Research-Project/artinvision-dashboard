"use server";

import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const parsed = RegisterSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid fields!" };
  }
  const data = parsed.data;

  if (await getUserByEmail(data.email)) {
    return { error: "Email already in use!" };
  }

  const hashed = await bcryptjs.hash(data.password, 10);

  let profileCreate;
  switch (data.accountType) {
    case "MUSEUM_ADMIN":
      profileCreate = {
        museumAdmin: {
          create: {
            museumName: data.museumName,
            about: data.about,
            address: data.address,
          },
        },
      };
      break;
    case "CURATOR":
      profileCreate = {
        curator: {
          create: {
            address: data.address,
            about: data.about,
            connect: data.connect,
          },
        },
      };
      break;
    case "ARTIST":
      profileCreate = {
        artist: {
          create: {
            address: data.address,
            bio: data.bio,
            connect: data.connect,
          },
        },
      };
      break;
  }

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashed,
      accountType: data.accountType,
      image: data.image,
      ...profileCreate,
    },
  });

  const verificationToken = await generateVerificationToken(data.email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  // return { success: "User created" };
  return { success: "Confirmation email sent" };
};
