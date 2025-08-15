import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collectionId: string }> } // keep Promise<> if you're on Next 15
) {
  const { collectionId } = await params;

  if (!collectionId) {
    return NextResponse.json(
      { error: "collectionId is required" },
      { status: 400 }
    );
  }

  try {
    const raw = await db.collection.findUnique({
      where: { id: collectionId },
      select: {
        id: true,
        name: true,
        status: true,
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

    if (!raw) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }
    if (raw.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Collection not available" },
        { status: 403 }
      );
    }

    const payload = {
      id: raw.id,
      name: raw.name,
      artworks: raw.artworkLinks.map((link) => ({
        id: link.artwork.id,
        title: link.artwork.title,
        images: link.artwork.images.map((img) => img.url),
      })),
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("collection GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
