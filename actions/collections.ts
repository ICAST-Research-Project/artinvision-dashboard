"use server";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { AccountType, CollectionStatus } from "@prisma/client";
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
      artworkLinks: {
        include: {
          collection: { select: { status: true } },
        },
      },
      _count: { select: { artworkLinks: true } },
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

export type CollectionSummary = {
  id: string;
  name: string;
  about: string;
  status: CollectionStatus;
};

export async function fetchCollectionsForUser(): Promise<CollectionSummary[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (session.user.accountType !== "CURATOR")
    throw new Error("Only curators can view collections");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { curator: true },
  });
  if (!user?.curator) throw new Error("Curator profile not found");

  return db.collection.findMany({
    where: { curatorId: user.curator.id },
    select: { id: true, name: true, about: true, status: true },
  });
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (session.user.accountType !== "CURATOR")
    throw new Error("Only curators can delete collections");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { curator: true },
  });
  if (!user?.curator) throw new Error("Curator profile not found");

  const col = await db.collection.findUnique({
    where: { id: collectionId },
    select: { curatorId: true },
  });
  if (!col) throw new Error("Collection not found");
  if (col.curatorId !== user.curator.id)
    throw new Error("Not authorized to delete this collection");

  await db.collectionArtwork.deleteMany({
    where: { collectionId },
  });

  await db.collection.delete({ where: { id: collectionId } });
}

export type CollectionRequest = {
  id: string;
  name: string;
  about: string;
  status: CollectionStatus;
  curatorName: string;
};

export async function fetchCollectionsForMuseumAdminRequests(): Promise<
  CollectionRequest[]
> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (session.user.accountType !== "MUSEUM_ADMIN")
    throw new Error("Only museum admins can view requests");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { museumAdmin: true },
  });
  if (!user?.museumAdmin) throw new Error("MuseumAdmin profile not found");

  const cols = await db.collection.findMany({
    where: { museumAdminId: user.museumAdmin.id },
    include: {
      curator: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return cols.map((c) => ({
    id: c.id,
    name: c.name,
    about: c.about,
    status: c.status,
    curatorName: c.curator.user.name ?? "",
  }));
}

export async function updateCollectionStatus(
  collectionId: string,
  status: CollectionStatus
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (session.user.accountType !== "MUSEUM_ADMIN")
    throw new Error("Only museum admins can update status");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { museumAdmin: true },
  });
  if (!user?.museumAdmin) throw new Error("MuseumAdmin profile not found");

  const col = await db.collection.findUnique({
    where: { id: collectionId },
    select: { museumAdminId: true },
  });
  if (!col) throw new Error("Collection not found");
  if (col.museumAdminId !== user.museumAdmin.id)
    throw new Error("Not authorized to update this collection");

  await db.collection.update({
    where: { id: collectionId },
    data: { status },
  });
}

export async function getCollectionById(id: string) {
  return db.collection.findUnique({
    where: { id },
    include: {
      museumAdmin: {
        select: { id: true, museumName: true },
      },
      curator: {
        include: {
          user: { select: { name: true } },
        },
      },
      artworkLinks: {
        include: {
          artwork: {
            include: {
              category: true,
              images: { select: { url: true } },
            },
          },
        },
      },
    },
  });
}

export async function updateCollectionAction(
  input: CreateCollectionInput & { id: string }
): Promise<{ id: string }> {
  const { id, name, about, museumAdminId, artworkIds } = input;

  await db.collection.update({
    where: { id },
    data: {
      name,
      about,
      museumAdminId,
      artworkLinks: {
        deleteMany: {}, // delete old links
        create: artworkIds.map((artworkId) => ({ artworkId })),
      },
    },
  });

  return { id };
}
