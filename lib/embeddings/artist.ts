import { db } from "@/lib/db";
import {
  embedText,
  TEXT_EMBEDDING_MODEL,
  asVectorLiteral,
} from "@/lib/embeddings/text";
import { buildArtistCanonicalText } from "../canonical/artist";

export async function upsertArtistTextEmbedding(artistId: string) {
  const canonical = await buildArtistCanonicalText(artistId);

  const vec = await embedText(canonical);
  const vecLit = asVectorLiteral(vec);

  await db.$executeRawUnsafe(
    `
    INSERT INTO artist_embeddings_text (artist_id, model, embedding, created_at, updated_at)
    VALUES ($1, $2, ${vecLit}, NOW(), NOW())
    ON CONFLICT (artist_id) DO UPDATE
    SET model = EXCLUDED.model,
        embedding = EXCLUDED.embedding,
        updated_at = NOW();
    `,
    artistId,
    TEXT_EMBEDDING_MODEL
  );
}
