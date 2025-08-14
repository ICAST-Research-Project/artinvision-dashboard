"use server";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";

import { db } from "@/lib/db";
import {
  ArtistArtworkInput,
  artistArtworkSchema,
  UpdateArtworkCuratorInput,
  updateArtworkCuratorSchema,
  UpdateArtworkInput,
  updateArtworkSchema,
} from "@/schemas";
import { AccountType } from "@prisma/client";

export type artworkParams = {
  title: string;
  artist: string;
  description: string;
  imageUrls: string[];
  categoryId: string;
};

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    throw new Error("User not found");
  }

  return user as { id: string; accountType: AccountType };
}

export const createArtwork = async ({
  title,
  artist,
  description,
  categoryId,
  imageUrls,
}: artworkParams) => {
  try {
    const { id: userId, accountType } = await getCurrentUser();

    const newArtwork = await db.artwork.create({
      data: {
        title: title,
        artist: artist,
        description: description,
        categoryId: categoryId,
        createdById: userId,
        creatorType: accountType,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newArtwork)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occured while creating the artwork",
    };
  }
};

async function getCurrentArtist() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const user = await getUserById(session.user.id);
  if (!user) throw new Error("User not found");
  if (user.accountType !== "ARTIST") throw new Error("Not an artist");
  return user;
}

async function getCurrentCurator() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const user = await getUserById(session.user.id);
  if (!user) throw new Error("User not found");
  if (user.accountType !== "CURATOR") throw new Error("Not an artist");
  return user;
}

export async function createArtworkByArtist(input: ArtistArtworkInput) {
  const { title, description, categoryId, imageUrls } =
    artistArtworkSchema.parse(input);

  const user = await getCurrentArtist();
  const artistName = user.name!;

  const newArtwork = await db.artwork.create({
    data: {
      title,
      description,
      categoryId,
      artist: artistName,
      createdById: user.id,
      creatorType: user.accountType,
      images: { create: imageUrls.map((url) => ({ url })) },
    },
    include: { images: true },
  });

  return { success: true, data: JSON.parse(JSON.stringify(newArtwork)) };
}

export async function getAllArtworks() {
  const user = await getCurrentUser();
  return await db.artwork.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
    },
  });
}

export async function getArtworkById(id: string) {
  const user = await getCurrentUser();
  return await db.artwork.findUniqueOrThrow({
    where: { id, createdById: user.id },
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
    },
  });
}

export async function toggleArtworkPublished(id: string, published: boolean) {
  const user = await getCurrentUser();
  return await db.artwork.updateMany({
    where: { id, createdById: user.id },
    data: { published },
  });
}

export async function updateArtworkByArtist(input: UpdateArtworkInput) {
  const { id, title, description, categoryId, imageUrls } =
    updateArtworkSchema.parse(input);

  const user = await getCurrentArtist();

  const existing = await db.artwork.findUnique({
    where: { id },
    select: { createdById: true },
  });
  if (!existing || existing.createdById !== user.id) {
    throw new Error("Artwork not found or your not its owner.");
  }

  const updated = await db.artwork.update({
    where: { id },
    data: {
      title,
      description,
      categoryId,
      images: {
        deleteMany: {},
        create: imageUrls.map((url) => ({ url })),
      },
    },
    include: {
      images: true,
      category: { select: { id: true, name: true } },
    },
  });

  return { success: true, data: JSON.parse(JSON.stringify(updated)) };
}

export async function updateArtworkByCurator(input: UpdateArtworkCuratorInput) {
  const { id, title, artist, description, categoryId, imageUrls } =
    updateArtworkCuratorSchema.parse(input);

  const user = await getCurrentCurator();

  const existing = await db.artwork.findUnique({
    where: { id },
    select: { createdById: true },
  });
  if (!existing || existing.createdById !== user.id) {
    throw new Error("Artwork not found or your not its owner.");
  }

  const updated = await db.artwork.update({
    where: { id },
    data: {
      title,
      artist,
      description,
      categoryId,
      images: {
        deleteMany: {},
        create: imageUrls.map((url) => ({ url })),
      },
    },
    include: {
      images: true,
      category: { select: { id: true, name: true } },
    },
  });

  return { success: true, data: JSON.parse(JSON.stringify(updated)) };
}

export async function deleteArtworkByArtistById(
  artworkId: string
): Promise<void> {
  if (!artworkId) {
    throw new Error("Missing artworkId");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const user = await getUserById(session.user.id);
  if (!user || user.accountType !== AccountType.ARTIST) {
    throw new Error("Not authorized");
  }

  const result = await db.artwork.deleteMany({
    where: { id: artworkId, createdById: user.id },
  });
  if (result.count === 0) {
    throw new Error("Artwork not found or not your own.");
  }
}

export async function deleteArtworkByCuratorId(
  artworkId: string
): Promise<void> {
  if (!artworkId) {
    throw new Error("Missing artworkId");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const user = await getUserById(session.user.id);
  if (!user || user.accountType !== AccountType.CURATOR) {
    throw new Error("Not authorized");
  }

  const result = await db.artwork.deleteMany({
    where: { id: artworkId, createdById: user.id },
  });
  if (result.count === 0) {
    throw new Error("Artwork not found or not your own.");
  }
}
