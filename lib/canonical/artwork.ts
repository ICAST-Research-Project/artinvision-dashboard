import { db } from "@/lib/db";

export async function buildArtworkCanonicalText(artworkId: string) {
  const art = await db.artwork.findUnique({
    where: { id: artworkId },
    include: { artistRel: true, category: true },
  });
  if (!art) throw new Error("Artwork not found");

  const parts = [
    `Title: ${art.title}`,
    `Description: ${art.description}`,
    `Artist: ${art.artistRel?.name ?? "Unknown"}`,
    art.artistRel?.bio ? `Artist bio: ${art.artistRel.bio}` : null,
    `Category: ${art.category?.name ?? "Uncategorized"}`,
  ].filter(Boolean);

  return parts.join("\n");
}
