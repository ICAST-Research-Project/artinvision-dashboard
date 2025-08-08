import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: { museumId: string } }
) {
  const { museumId } = await context.params;

  const raw = await db.collection.findMany({
    where: {
      museumAdmin: { userId: museumId },
    },
    select: {
      id: true,
      name: true,
      artworkLinks: {
        include: {
          artwork: {
            select: {
              id: true,
              title: true,
              images: { select: { url: true } },
            },
          },
        },
      },
    },
  });

  const collections = raw.map((c) => ({
    id: c.id,
    name: c.name,
    artworks: c.artworkLinks.map((link) => ({
      id: link.artwork.id,
      title: link.artwork.title,
      images: link.artwork.images.map((img) => img.url),
    })),
  }));

  return NextResponse.json(collections);
}
