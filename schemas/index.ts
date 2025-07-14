import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// export const RegisterSchema = z.object({
//   email: z.email({ message: "Email is required" }),
//   password: z.string().min(6, { message: "Minimum 6 characters required" }),
//   name: z.string().min(1, { message: "Name is required" }),
// });

const Base = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "A valid email is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
});

export const RegisterSchema = z.discriminatedUnion("accountType", [
  Base.extend({
    accountType: z.literal("MUSEUM_ADMIN"),
    museumName: z.string().min(1, { message: "Museum name is required" }),
    about: z.string().min(1, { message: "About is required" }),
    address: z.string().min(1, { message: "Address is required" }),
  }),
  Base.extend({
    accountType: z.literal("CURATOR"),
    address: z.string().min(1, { message: "Address is required" }),
    about: z.string().min(1, { message: "About is required" }),
    connect: z.string().optional(),
  }),
  Base.extend({
    accountType: z.literal("ARTIST"),
    address: z.string().min(1, { message: "Address is required" }),
    bio: z.string().min(1, { message: "Bio is required" }),
    background: z.string().min(1, { message: "Background is required" }),
    education: z.string().min(1, { message: "Education is required" }),
    connect: z.string().optional(),
  }),
]);
