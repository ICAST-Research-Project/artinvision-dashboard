"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const createArtistQuickSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
});

export async function listArtists(q?: string) {
  return db.artist.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createArtistQuick(
  values: z.infer<typeof createArtistQuickSchema>
) {
  const parsed = createArtistQuickSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  const a = await db.artist.create({
    data: { name: parsed.data.name, bio: parsed.data.bio },
    select: { id: true, name: true },
  });
  return { success: true, data: a };
}
