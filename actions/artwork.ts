/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { upsertArtistTextEmbedding } from "@/lib/embeddings/artist";
import {
  // upsertArtworkImageEmbedding,
  upsertArtworkTextEmbedding,
  upsertAllArtworkImageEmbeddings,
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

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import QRCode from "qrcode";

// ===== Dedicated QR bucket (fallbacks to the main one if unset)
const QR_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_QR; // your QR bucket

// Build the public base for the QR bucket
const QR_PUBLIC_BASE =
  (process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3_QR
    ? `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3_QR}`
    : `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3}`
  ).replace(/\/+$/, "") +
  "/" +
  (process.env.NEXT_PUBLIC_S3_BUCKET_NAME_QR ||
    process.env.NEXT_PUBLIC_S3_BUCKET_NAME);

// Where QR points (later your /qr page will read ?aid=...)
const QR_TARGET_BASE =
  process.env.NEXT_PUBLIC_QR_TARGET_BASE ||
  (process.env.NEXT_PUBLIC_APP_BASE_URL
    ? `${process.env.NEXT_PUBLIC_APP_BASE_URL}/qr`
    : "https://example.com/qr");

/** Build the URL the QR points to, e.g. https://app/qr?aid=<artworkId> */
function makeQrTargetUrl(artworkId: string): string {
  const url = new URL(QR_TARGET_BASE);
  url.searchParams.set("aid", artworkId);
  return url.toString();
}

/** Generate a PNG buffer for a QR code */
async function generateQrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: "M",
    width: 512,
    margin: 2,
    type: "png",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

async function uploadQrToS3(key: string, png: Buffer): Promise<string> {
  await S3.send(
    new PutObjectCommand({
      Bucket: QR_BUCKET, // ← QR bucket
      Key: key,
      Body: png,
      ContentType: "image/png",
      // Tip: if an <img> preview ever triggers a download instead of displaying,
      // remove ContentDisposition below and rely on <a download> in the UI.
      ContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
      // ACL: "public-read", // only if your bucket policy isn’t already public
    })
  );
  return `${QR_PUBLIC_BASE}/${key}`;
}

/** Create + upload QR, then persist on the artwork row */
async function generateAndSaveArtworkQr(artworkId: string) {
  const target = makeQrTargetUrl(artworkId);
  const png = await generateQrPng(target);
  const key = `qr/artworks/${artworkId}.png`;
  const publicUrl = await uploadQrToS3(key, png);

  await db.artwork.update({
    where: { id: artworkId },
    data: { qrCodeUrl: publicUrl },
  });

  return publicUrl;
}

function qrUrlToKey(input?: string | null): string {
  if (!input) return "";
  // 1) Fast path: strip the known public base
  if (input.startsWith(QR_PUBLIC_BASE + "/")) {
    return input.slice((QR_PUBLIC_BASE + "/").length);
  }
  // 2) Fallback: parse URL and remove bucket prefix if present
  try {
    const url = new URL(input);
    const path = url.pathname.startsWith("/")
      ? url.pathname.slice(1)
      : url.pathname;
    if (QR_BUCKET && path.startsWith(QR_BUCKET + "/"))
      return path.slice(QR_BUCKET.length + 1);
    return path; // key-only path
  } catch {
    return input; // best effort
  }
}

async function deleteQrKey(key: string) {
  if (!key) return;
  try {
    await S3.send(new DeleteObjectCommand({ Bucket: QR_BUCKET, Key: key }));
  } catch (e) {
    console.error("Failed to delete QR from S3", key, e);
  }
}

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
      // await upsertArtworkImageEmbedding(newArtwork.id);
      await upsertAllArtworkImageEmbeddings(newArtwork.id);
    } catch (e) {
      console.error("Embedding (createArtwork) failed", e);
    }

    // try {
    //   await generateAndSaveArtworkQr(newArtwork.id);
    // } catch (e) {
    //   console.error("QR generation failed", e);
    // }

    const fresh = await db.artwork.findUniqueOrThrow({
      where: { id: newArtwork.id },
      include: { images: true },
    });

    return { success: true, data: JSON.parse(JSON.stringify(fresh)) };
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
    // await upsertArtworkImageEmbedding(newArtwork.id);
    await upsertAllArtworkImageEmbeddings(newArtwork.id);
  } catch (e) {
    console.error("Embedding (createArtworkByArtist) failed", e);
  }

  try {
    await generateAndSaveArtworkQr(newArtwork.id);
  } catch (e) {
    console.error("QR generation failed", e);
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

// export async function getArtworkById(id: string) {
//   const user = await getCurrentUser();
//   return await db.artwork.findUniqueOrThrow({
//     where: { id, createdById: user.id },
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

export async function getArtworkById(id: string) {
  const user = await getCurrentUser();

  const art = await db.artwork.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      createdById: true,
      qrCodeUrl: true,
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true } },
      artistId: true,
      artistRel: { select: { id: true, name: true, userId: true } },
    },
  });

  if (!art || art.createdById !== user.id) {
    throw new Error("Not found or not allowed");
  }

  // derive whether the logged-in user is the artist for this artwork
  const meAsArtistSuggested =
    !!art.artistRel?.userId && art.artistRel.userId === user.id;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdById, ...rest } = art;
  return { rest, meAsArtistSuggested };
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
    // await upsertArtworkImageEmbedding(id);
    await upsertAllArtworkImageEmbeddings(id);
  } catch (e) {
    console.error("Embedding (updateArtworkByArtist) failed", e);
  }

  return { success: true, data: JSON.parse(JSON.stringify(updated)) };
}

// export const updateArtworkByCurator = async ({
//   id,
//   title,
//   artistId,
//   description,
//   categoryId,

//   imageUrls,
//   meAsArtist,
// }: { id: string } & artworkParams) => {
//   const auth = await getCurrentUser();
//   if (!auth) return { success: false, message: "Unauthorized" };
//   const { id: userId } = auth;

//   const existing = await db.artwork.findUnique({
//     where: { id },
//     select: {
//       createdById: true,
//       artistId: true,
//       images: { select: { url: true } },
//     },
//   });
//   if (!existing || existing.createdById !== userId) {
//     return { success: false, message: "Not found or not allowed" };
//   }

//   const [u, curator] = await Promise.all([
//     db.user.findUnique({
//       where: { id: userId },
//       select: { name: true, email: true },
//     }),
//     db.curator.findUnique({ where: { userId }, select: { about: true } }),
//   ]);
//   const displayName =
//     (u?.name && u.name.trim()) ||
//     (u?.email ? u.email.split("@")[0] : null) ||
//     "Untitled Artist";
//   const bioText = curator?.about ?? "";

//   // Normalize incoming artistId (empty string → undefined)
//   const normalizeId = (s?: string | null) =>
//     s && s.trim().length ? s : undefined;

//   let finalArtistId = existing.artistId;
//   const incomingArtistId = normalizeId(artistId);

//   if (meAsArtist) {
//     const me = await db.artist.upsert({
//       where: { userId },
//       update: { name: displayName, bio: bioText },
//       create: { userId, name: displayName, bio: bioText },
//       select: { id: true },
//     });
//     finalArtistId = me.id;

//     try {
//       await upsertArtistTextEmbedding(me.id);
//     } catch (e) {
//       console.error("Embedding (artist text) failed", e);
//     }
//   } else if (incomingArtistId) {
//     // Optional: validate the selected artist exists to avoid FK errors
//     const exists = await db.artist.findUnique({
//       where: { id: incomingArtistId },
//       select: { id: true },
//     });
//     if (!exists) {
//       return { success: false, message: "Selected artist no longer exists." };
//     }
//     finalArtistId = incomingArtistId;
//   }

//   if (!finalArtistId) {
//     return {
//       success: false,
//       message: 'Artist is required (pick one or choose "I’m the artist").',
//     };
//   }

//   const incoming = new Set(
//     (imageUrls ?? []).map((u) => u.trim()).filter(Boolean)
//   );
//   const already = new Set((existing.images ?? []).map((i) => i.url));
//   const newOnly = [...incoming].filter((u) => !already.has(u));

//   // Build images mutation: APPEND new ones (don’t delete existing)
//   // const imagesMutation =
//   //   imageUrls && imageUrls.length
//   //     ? { create: imageUrls.map((url) => ({ url })) }
//   //     : undefined;
//   const imagesMutation = newOnly.length
//     ? { create: newOnly.map((url) => ({ url })) }
//     : undefined;

//   const updated = await db.artwork.update({
//     where: { id },
//     data: {
//       title,
//       description,
//       categoryId,
//       artistId: finalArtistId,
//       ...(imagesMutation ? { images: imagesMutation } : {}), // append if provided
//     },
//     include: { images: true },
//   });

//   try {
//     await upsertArtworkTextEmbedding(updated.id);
//     await upsertAllArtworkImageEmbeddings(updated.id);
//   } catch {}
//   return { success: true, data: JSON.parse(JSON.stringify(updated)) };
// };

export const updateArtworkByCurator = async ({
  id,
  title,
  artistId,
  description,
  categoryId,
  imageUrls,
  meAsArtist,
}: { id: string } & artworkParams) => {
  const auth = await getCurrentUser();
  if (!auth) return { success: false, message: "Unauthorized" };
  const { id: userId } = auth;

  // Load existing (owner + current artist + existing images)
  const existing = await db.artwork.findUnique({
    where: { id },
    select: {
      createdById: true,
      artistId: true,
      images: { select: { url: true } },
    },
  });
  if (!existing || existing.createdById !== userId) {
    return { success: false, message: "Not found or not allowed" };
  }

  // Curator's display name/bio (for meAsArtist upsert)
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

  // Normalize incoming artistId
  const normalizeId = (s?: string | null) =>
    s && s.trim().length ? s : undefined;

  let finalArtistId = existing.artistId;
  const incomingArtistId = normalizeId(artistId);

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
  } else if (incomingArtistId) {
    const exists = await db.artist.findUnique({
      where: { id: incomingArtistId },
      select: { id: true },
    });
    if (!exists) {
      return { success: false, message: "Selected artist no longer exists." };
    }
    finalArtistId = incomingArtistId;
  }

  if (!finalArtistId) {
    return {
      success: false,
      message: 'Artist is required (pick one or choose "I’m the artist").',
    };
  }

  // --- Image reconciliation ---
  const incoming = (imageUrls ?? []).map((u) => u.trim()).filter(Boolean);
  const existingUrls = new Set((existing.images ?? []).map((i) => i.url));
  const incomingSet = new Set(incoming);

  const toCreate = incoming.filter((u) => !existingUrls.has(u));
  const toDelete = (existing.images ?? [])
    .filter((i) => !incomingSet.has(i.url))
    .map((i) => i.url);

  // Transaction: update main fields + delete missing + add new
  await db.$transaction([
    db.artwork.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        artistId: finalArtistId,
      },
    }),
    ...(toDelete.length
      ? [
          db.artworkImage.deleteMany({
            where: { artworkId: id, url: { in: toDelete } },
          }),
        ]
      : []),
    ...(toCreate.length
      ? [
          db.artworkImage.createMany({
            data: toCreate.map((url) => ({ artworkId: id, url })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);

  // Re-embed (optional but recommended)
  try {
    await upsertArtworkTextEmbedding(id);
    await upsertAllArtworkImageEmbeddings(id);
  } catch (e) {
    console.error("Embedding (updateArtworkByCurator) failed", e);
  }

  // Revalidate pages so you don’t see stale images
  revalidatePath(`/curator/artworks/${id}`);
  revalidatePath(`/curator/artworks`);

  // Return fresh
  const fresh = await db.artwork.findUnique({
    where: { id },
    include: { images: true, category: { select: { id: true, name: true } } },
  });

  return { success: true, data: JSON.parse(JSON.stringify(fresh)) };
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

  // const result = await db.artwork.deleteMany({
  //   where: { id: artworkId, createdById: user.id },
  // });
  // if (result.count === 0) {
  //   throw new Error("Artwork not found or not your own.");
  // }

  // Below Changes is for deleting the artowork images in the S3 bucket
  // 1) Load images BEFORE deleting rows
  const art = await db.artwork.findFirst({
    where: { id: artworkId, createdById: user.id },
    include: { images: { select: { id: true, url: true } } },
  });
  if (!art) throw new Error("Artwork not found or not your own.");

  // 2) Delete from S3 (best-effort)
  const keys = (art.images ?? [])
    .map((img) => urlToKey(img.url))
    .filter(Boolean);
  await deleteS3Keys(keys);
  const qrKey = qrUrlToKey((art as any).qrCodeUrl);
  await deleteQrKey(qrKey);

  // 3) Delete DB rows (transaction recommended)
  await db.$transaction([
    db.artworkImage.deleteMany({ where: { artworkId } }), // if your model is ArtworkImage
    db.artwork.delete({ where: { id: artworkId } }),
  ]);
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

  // const result = await db.artwork.deleteMany({
  //   where: { id: artworkId, createdById: user.id },
  // });
  // if (result.count === 0) {
  //   throw new Error("Artwork not found or not your own.");
  // }

  // Below Changes is for deleting the artowork images in the S3 bucket
  // 1) Load images BEFORE deleting rows
  const art = await db.artwork.findFirst({
    where: { id: artworkId, createdById: user.id },
    include: { images: { select: { id: true, url: true } } },
  });
  if (!art) throw new Error("Artwork not found or not your own.");

  // 2) Delete from S3 (best-effort)
  const keys = (art.images ?? [])
    .map((img) => urlToKey(img.url))
    .filter(Boolean);
  await deleteS3Keys(keys);
  const qrKey = qrUrlToKey((art as any).qrCodeUrl);
  await deleteQrKey(qrKey);

  // 3) Delete DB rows
  await db.$transaction([
    db.collectionArtwork.deleteMany({ where: { artworkId } }), // ← delete joins first
    db.artworkImage.deleteMany({ where: { artworkId } }),
    db.artwork.delete({ where: { id: artworkId } }),
  ]);
}

// Below code is for deleting the artowrks in the S3 Bucket, once the Artworks is deleted.

import { S3 } from "@/lib/s3Client";

const BUCKET =
  process.env.S3_BUCKET_NAME || process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3}/${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}`;

function urlToKey(input: string): string {
  if (!input) return "";
  if (input.startsWith(PUBLIC_BASE + "/")) {
    return input.slice((PUBLIC_BASE + "/").length);
  }

  try {
    const url = new URL(input);
    const path = url.pathname.startsWith("/")
      ? url.pathname.slice(1)
      : url.pathname;
    if (path.startsWith(BUCKET + "/")) return path.slice(BUCKET.length + 1);
    return path;
  } catch {
    return input;
  }
}

async function deleteS3Keys(keys: string[]) {
  await Promise.all(
    keys.map(async (Key) => {
      try {
        await S3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key }));
      } catch (e) {
        console.error("Failed to delete S3 object", Key, e);
      }
    })
  );
}
