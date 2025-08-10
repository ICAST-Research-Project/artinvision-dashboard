import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ museumId: string }> }
) {
  const { museumId } = await params;

  if (!museumId) {
    return NextResponse.json(
      { error: "museumId is required" },
      { status: 400 }
    );
  }

  try {
    const raw = await db.collection.findMany({
      where: { museumAdminId: museumId },
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
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(collections, { status: 200 });
  } catch (err) {
    console.error("collections GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
