"use server";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { upsertArtistTextEmbedding } from "@/lib/embeddings/artist";
import {
  upsertArtworkImageEmbedding,
  upsertArtworkTextEmbedding,
} from "@/lib/upsert-embeddings";
import {
  ArtistArtworkInput,
  artistArtworkSchema,
  // UpdateArtworkCuratorInput,
  // updateArtworkCuratorSchema,
  UpdateArtworkInput,
  updateArtworkSchema,
} from "@/schemas";
import { AccountType } from "@prisma/client";

export type artworkParams = {
  title: string;
  artistId: string;
  description: string;
  imageUrls: string[];
  categoryId: string;
  meAsArtist: boolean;
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
  artistId,
  description,
  categoryId,
  imageUrls,
  meAsArtist,
}: artworkParams) => {
  try {
    const auth = await getCurrentUser();
    if (!auth) return { success: false, message: "Unauthorized" };
    const { id: userId, accountType } = auth;

    const [u, curator] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
      db.curator.findUnique({ where: { userId }, select: { about: true } }),
    ]);

    const displayName =
      (u?.name && u.name.trim()) ||
      (u?.email ? u.email.split("@")[0] : null) ||
      "Untitled Artist";
    const bioText = curator?.about ?? "";

    let finalArtistId: string | null = artistId || null;

    if (meAsArtist) {
      const me = await db.artist.upsert({
        where: { userId },
        update: {
          name: displayName,
          bio: bioText,
        },
        create: {
          userId,
          name: displayName,
          bio: bioText,
        },
        select: { id: true },
      });
      finalArtistId = me.id;

      try {
        await upsertArtistTextEmbedding(me.id);
      } catch (e) {
        console.error("Embedding (artist text) failed", e);
      }
    }

    if (!finalArtistId) {
      return {
        success: false,
        message: 'Artist is required (pick one or choose "I’m the artist").',
      };
    }

    const newArtwork = await db.artwork.create({
      data: {
        title,
        artistId: finalArtistId,
        description,
        categoryId,
        createdById: userId,
        creatorType: accountType,
        images: { create: imageUrls.map((url) => ({ url })) },
      },
      include: { images: true },
    });

    try {
      await upsertArtworkTextEmbedding(newArtwork.id);
      await upsertArtworkImageEmbedding(newArtwork.id);
    } catch (e) {
      console.error("Embedding (createArtwork) failed", e);
    }

    return { success: true, data: JSON.parse(JSON.stringify(newArtwork)) };
  } catch (error) {
    console.error(error);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const artistRow = await db.artist.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!artistRow) throw new Error("Artist profile not found for this user");

  const newArtwork = await db.artwork.create({
    data: {
      title,
      description,
      categoryId,
      artistId: artistRow.id,
      createdById: user.id,
      creatorType: user.accountType,
      images: { create: imageUrls.map((url) => ({ url })) },
    },
    include: { images: true },
  });
  try {
    await upsertArtworkTextEmbedding(newArtwork.id);
    await upsertArtworkImageEmbedding(newArtwork.id);
  } catch (e) {
    console.error("Embedding (createArtworkByArtist) failed", e);
  }

  return { success: true, data: JSON.parse(JSON.stringify(newArtwork)) };
}

// export async function getAllArtworks() {
//   const user = await getCurrentUser();
//   return await db.artwork.findMany({
//     where: { createdById: user.id },
//     orderBy: { createdAt: "desc" },
//     include: {
//       category: { select: { id: true, name: true } },
//       images: { select: { id: true, url: true } },
//       artistRel: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//     },
//   });
// }
// actions/artwork.ts

export type ArtworkFilter = "all" | "self" | "others";
export async function getAllArtworks(filter: ArtworkFilter = "all") {
  const user = await getCurrentUser();

  const and: Prisma.ArtworkWhereInput[] = [{ createdById: user.id }];

  if (filter === "self") {
    and.push({ artistRel: { is: { userId: user.id } } });
  } else if (filter === "others") {
    and.push({
      OR: [
        { artistRel: { is: { userId: null } } },
        { artistRel: { is: { userId: { not: user.id } } } },
      ],
    });
  }

  const where: Prisma.ArtworkWhereInput = { AND: and };

  return db.artwork.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
      artistRel: { select: { id: true, name: true, userId: true } },
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
      artistRel: {
        select: {
          id: true,
          name: true,
        },
      },
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
  try {
    await upsertArtworkTextEmbedding(id);
    await upsertArtworkImageEmbedding(id);
  } catch (e) {
    console.error("Embedding (updateArtworkByArtist) failed", e);
  }

  return { success: true, data: JSON.parse(JSON.stringify(updated)) };
}

export const updateArtworkByCurator = async ({
  id,
  title,
  artistId,
  description,
  categoryId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  imageUrls,
  meAsArtist,
}: { id: string } & artworkParams) => {
  const auth = await getCurrentUser();
  if (!auth) return { success: false, message: "Unauthorized" };
  const { id: userId } = auth;

  const [u, curator] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    db.curator.findUnique({ where: { userId }, select: { about: true } }),
  ]);
  const displayName =
    (u?.name && u.name.trim()) ||
    (u?.email ? u.email.split("@")[0] : null) ||
    "Untitled Artist";
  const bioText = curator?.about ?? "";

  let finalArtistId: string | null = artistId || null;

  if (meAsArtist) {
    const me = await db.artist.upsert({
      where: { userId },
      update: { name: displayName, bio: bioText },
      create: { userId, name: displayName, bio: bioText },
      select: { id: true },
    });
    finalArtistId = me.id;

    try {
      await upsertArtistTextEmbedding(me.id);
    } catch (e) {
      console.error("Embedding (artist text) failed", e);
    }
  }

  if (!finalArtistId) {
    return {
      success: false,
      message: 'Artist is required (pick one or choose "I’m the artist").',
    };
  }

  const updated = await db.artwork.update({
    where: { id },
    data: {
      title,
      description,
      categoryId,
      artistId: finalArtistId,
    },
    include: { images: true },
  });

  try {
    await upsertArtworkTextEmbedding(updated.id);
  } catch {}
  return { success: true, data: JSON.parse(JSON.stringify(updated)) };
};

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
