import { db } from "@/lib/db";
import { buildArtworkCanonicalText } from "@/lib/canonical/artwork";
import { buildArtistCanonicalText } from "@/lib/canonical/artist";
import {
  embedText,
  asVectorLiteral,
  TEXT_EMBEDDING_MODEL,
} from "@/lib/embeddings/text";
import {
  embedImageFromUrl,
  IMAGE_EMBEDDING_MODEL,
} from "@/lib/embeddings/image";

export async function upsertArtworkTextEmbedding(artworkId: string) {
  const text = await buildArtworkCanonicalText(artworkId);
  const vec = await embedText(text);
  const lit = asVectorLiteral(vec);
  await db.$executeRawUnsafe(
    `
    INSERT INTO artwork_embeddings_text (artwork_id, model, embedding)
    VALUES ($1, $2, ${lit}::vector)
    ON CONFLICT (artwork_id)
    DO UPDATE SET model = EXCLUDED.model,
                  embedding = EXCLUDED.embedding,
                  updated_at = NOW()
  `,
    artworkId,
    TEXT_EMBEDDING_MODEL
  );
}

export async function upsertArtworkImageEmbedding(
  artworkId: string,
  imageUrl?: string
) {
  let url = imageUrl;
  if (!url) {
    const img = await db.artworkImage.findFirst({
      where: { artworkId },
      orderBy: { id: "asc" },
      select: { url: true },
    });
    url = img?.url;
  }
  if (!url) return;

  const vec = await embedImageFromUrl(url);
  const lit = `'[${vec.join(",")}]'`;
  await db.$executeRawUnsafe(
    `
    INSERT INTO artwork_embeddings_image (artwork_id, model, embedding)
    VALUES ($1, $2, ${lit}::vector)
    ON CONFLICT (artwork_id)
    DO UPDATE SET model = EXCLUDED.model,
                  embedding = EXCLUDED.embedding,
                  updated_at = NOW()
  `,
    artworkId,
    IMAGE_EMBEDDING_MODEL
  );
}

export async function upsertArtistTextEmbedding(artistId: string) {
  const text = await buildArtistCanonicalText(artistId);
  const vec = await embedText(text);
  const lit = asVectorLiteral(vec);
  await db.$executeRawUnsafe(
    `
    INSERT INTO artist_embeddings_text (artist_id, model, embedding)
    VALUES ($1, $2, ${lit}::vector)
    ON CONFLICT (artist_id)
    DO UPDATE SET model = EXCLUDED.model,
                  embedding = EXCLUDED.embedding,
                  updated_at = NOW()
  `,
    artistId,
    TEXT_EMBEDDING_MODEL
  );
}
