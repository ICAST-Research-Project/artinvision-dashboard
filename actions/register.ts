"use server";

import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const parsed = RegisterSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid fields!" };
  }
  const data = parsed.data;

  if (await getUserByEmail(data.email)) {
    return { error: "Email already in use!" };
  }

  const hashed = await bcrypt.hash(data.password, 10);

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
            background: data.background,
            education: data.education,
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
      ...profileCreate,
    },
  });

  return { success: "User created" };
};
