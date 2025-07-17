"use server";

import { db } from "@/lib/db";

export type artworkParams = {
  title: string;
  artist: string;
  description: string;
  imageUrls: string[];
  categoryId: string;
};

export const createArtwork = async ({
  title,
  artist,
  description,
  categoryId,
  imageUrls,
}: artworkParams) => {
  try {
    const newArtwork = await db.artwork.create({
      data: {
        title: title,
        artist: artist,
        description: description,
        categoryId: categoryId,
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
  return await db.artwork.findMany({
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
    },
  });
}
export async function getArtworkById(id: string) {
  return await db.artwork.findUniqueOrThrow({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
    },
  });
}
