"use server";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { AccountType } from "@prisma/client";
import { collectionSchema } from "@/schemas";
import type { z } from "zod";

export type CreateCollectionInput = z.infer<typeof collectionSchema>;

export async function createCollectionAction(
  input: CreateCollectionInput
): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await getUserById(session.user.id);
  if (!user) throw new Error("User not found");
  if (user.accountType !== AccountType.CURATOR) {
    throw new Error("Only curators can create collections");
  }

  const curator = await db.curator.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!curator) throw new Error("Curator profile not found");

  const { name, about, museumAdminId, artworkIds } =
    collectionSchema.parse(input);

  const created = await db.collection.create({
    data: {
      name,
      about,
      museumAdminId,
      curatorId: curator.id,
      artworkLinks: {
        create: artworkIds.map((artId) => ({ artworkId: artId })),
      },
    },
    select: { id: true },
  });

  return created;
}

export async function fetchMuseums() {
  return db.museumAdmin.findMany({
    select: { id: true, museumName: true },
    orderBy: { museumName: "asc" },
  });
}

export async function fetchArtworks() {
  return db.artwork.findMany({
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
    },
    orderBy: { title: "asc" },
  });
}

export async function fetchCategories() {
  return db.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
