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
