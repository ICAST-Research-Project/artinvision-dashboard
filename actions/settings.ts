"use server";

import * as z from "zod";
import {
  artistSettingsSchema,
  curatorSettingsSchema,
  museumAdminSettingsSchema,
} from "@/schemas";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { AccountType } from "@prisma/client";
import { auth } from "@/auth";
import { upsertArtistTextEmbedding } from "@/lib/embeddings/artist";

export const getCurrentMuseumAdmin = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      museumAdmin: true,
    },
  });

  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    image: user?.image,
    accountType: user?.accountType,
    museumAdmin: user?.museumAdmin || null,
  };
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

export const museumAdminSettings = async (
  values: z.infer<typeof museumAdminSettingsSchema>
) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: { museumAdmin: true },
  });

  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: values.name,
      phone: values.phone,
    },
  });

  if (dbUser.museumAdmin?.id) {
    await db.museumAdmin.update({
      where: {
        id: dbUser.museumAdmin.id,
      },
      data: {
        museumName: values.museumName,
        about: values.about,
        address: values.address,
      },
    });
  }
  return { success: "Profile Updated" };
};

export const getCurrentCurator = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      curator: true,
    },
  });

  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    image: user?.image,
    accountType: user?.accountType,
    curator: user?.curator,
  };
};

// export const curatorSettings = async (
//   values: z.infer<typeof curatorSettingsSchema>
// ) => {
//   const user = await getCurrentUser();

//   if (!user) {
//     return { error: "Unauthorized" };
//   }

//   const dbUser = await db.user.findUnique({
//     where: { id: user.id },
//     include: { curator: true },
//   });

//   if (!dbUser) {
//     return { error: "Unauthorized" };
//   }

//   await db.user.update({
//     where: { id: dbUser.id },
//     data: {
//       name: values.name,
//       phone: values.phone,
//     },
//   });

//   if (dbUser.curator?.id) {
//     await db.curator.update({
//       where: {
//         id: dbUser.curator.id,
//       },
//       data: {
//         about: values.about,
//         address: values.address,
//         connect: values.connect,
//       },
//     });
//   }

//   return { success: "Profile Updated" };
// };

export const curatorSettings = async (
  values: z.infer<typeof curatorSettingsSchema>
) => {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: { curator: true },
  });
  if (!dbUser) return { error: "Unauthorized" };

  // 1) Update basic user fields
  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: values.name,
      phone: values.phone,
    },
  });

  // 2) Update Curator profile
  if (dbUser.curator?.id) {
    await db.curator.update({
      where: { id: dbUser.curator.id },
      data: {
        about: values.about,
        address: values.address,
        connect: values.connect,
      },
    });
  }

  // 3) Mirror to Artist and re-embed
  //    - Ensure an Artist row exists for this user
  //    - Keep Artist.name in sync with User.name (fallback to email local-part)
  const displayName =
    (values.name && values.name.trim()) ||
    (dbUser.name && dbUser.name.trim()) ||
    (dbUser.email ? dbUser.email.split("@")[0] : "Untitled Artist");

  const me = await db.artist.upsert({
    where: { userId: dbUser.id }, // unique on Artist.userId
    update: {
      name: displayName,
      bio: values.about ?? "", // mirror curator.about
    },
    create: {
      userId: dbUser.id,
      name: displayName,
      bio: values.about ?? "",
    },
    select: { id: true },
  });

  // 4) Refresh artist text embedding (name + bio)
  try {
    await upsertArtistTextEmbedding(me.id);
  } catch (e) {
    console.error("Artist re-embed failed", e);
    // do not fail the settings update over embeddings
  }

  return { success: "Profile Updated" };
};

export const getCurrentArtist = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      artist: true,
    },
  });

  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    image: user?.image,
    accountType: user?.accountType,
    artist: user?.artist,
  };
};

export const artistSettings = async (
  values: z.infer<typeof artistSettingsSchema>
) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: { artist: true },
  });

  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: values.name,
      phone: values.phone,
    },
  });

  if (dbUser.artist?.id) {
    const updated = await db.artist.update({
      where: {
        id: dbUser.artist.id,
      },
      data: {
        bio: values.bio,
        address: values.address,
        connect: values.connect,
        name:
          values.name ??
          dbUser.name ??
          dbUser.email?.split("@")[0] ??
          "Untitled Artist",
      },
      select: { id: true },
    });
    try {
      await upsertArtistTextEmbedding(updated.id);
    } catch (e) {
      console.error("Artist re-embed failed", e);
    }
  }
  return { success: "Profile Updated" };
};
