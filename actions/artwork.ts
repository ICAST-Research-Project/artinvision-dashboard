"use server";

import { db } from "@/lib/db";

export type artworkParams = {
  title: string;
  artist: string;
  description: string;
  //   imageUrl: string
  categoryId: string;
};

export const createArtwork = async ({
  title,
  artist,
  description,
  categoryId,
}: artworkParams) => {
  try {
    const newArtwork = await db.artwork.create({
      data: {
        title: title,
        artist: artist,
        description: description,
        categoryId: categoryId,
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
