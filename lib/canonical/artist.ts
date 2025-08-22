import { db } from "@/lib/db";

export async function buildArtistCanonicalText(artistId: string) {
  const a = await db.artist.findUnique({ where: { id: artistId } });
  if (!a) throw new Error("Artist not found");
  return [`Name: ${a.name}`, a.bio ? `Bio: ${a.bio}` : null]
    .filter(Boolean)
    .join("\n");
}
