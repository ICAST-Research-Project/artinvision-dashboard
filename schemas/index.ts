import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const ResetSchema = z.object({
  email: z.email({ message: "Email is required" }),
});

export const NewPassowordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Minimum of 6 characters is required" }),
});

const Base = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "A valid email is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
  image: z.url(),
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
    connect: z.string().optional(),
  }),
]);

export const artworkSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().min(10),
  artist: z.string().trim().min(1).max(100),
  imageUrls: z.array(z.url()).min(1, "Upload at least one image"),
  categoryId: z.string(),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2),
  about: z.string().trim().min(2),
  museumAdminId: z.string().nonempty("Please select a museum"),
  artworkIds: z.array(z.string()).min(1, "Select at least one artwork"),
});

export const CategorySchema = z.object({
  id: z.string().nonempty(),
  name: z.string().min(1),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;

export const artistArtworkSchema = artworkSchema.omit({ artist: true });
export type ArtistArtworkInput = z.infer<typeof artistArtworkSchema>;

export const updateArtworkSchema = artistArtworkSchema.extend({
  id: z.string(),
});
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;

export const updateArtworkCuratorSchema = artworkSchema.extend({
  id: z.string(),
});

export type UpdateArtworkCuratorInput = z.infer<
  typeof updateArtworkCuratorSchema
>;

export const museumAdminSettingsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  museumName: z.string().min(1, { message: "Museum name is required" }),
  about: z.string().min(1, { message: "About is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  image: z.url(),
});

export const curatorSettingsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  about: z.string().min(1, { message: "About is required" }),
  image: z.url(),
  address: z.string().min(1, { message: "Address is required" }),
  connect: z.string().optional(),
});

export const artistSettingsSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  bio: z.string().min(1, { message: "Bio is required" }),
  image: z.url(),
  address: z.string().min(1, { message: "Address is required" }),
  connect: z.string().optional(),
});
