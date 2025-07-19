"use server";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";

import { db } from "@/lib/db";
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
