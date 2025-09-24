// Command: npm run backfill:embeddings
import { db } from "@/lib/db";
import {
  upsertArtistTextEmbedding,
  upsertArtworkTextEmbedding,
  upsertSingleArtworkImageEmbedding,
} from "@/lib/upsert-embeddings";

const BATCH_CONCURRENCY = 5;
const LOG_EVERY = 25;
const INCLUDE_ONLY_PUBLISHED = false;

type MissingImageRow = {
  artworkId: string;
  artworkImageId: string;
  url: string | null;
};

async function getMissingArtistIds(): Promise<string[]> {
  const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(`
    SELECT a.id
    FROM "Artist" a
    LEFT JOIN artist_embeddings_text t ON t.artist_id = a.id
    WHERE t.artist_id IS NULL
    ORDER BY a."createdAt" ASC
  `);
  return rows.map((r) => r.id);
}

async function getMissingArtworkTextIds(): Promise<string[]> {
  const wherePublished = INCLUDE_ONLY_PUBLISHED
    ? `AND aw.published = TRUE`
    : ``;
  const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(`
    SELECT aw.id
    FROM "Artwork" aw
    LEFT JOIN artwork_embeddings_text t ON t.artwork_id = aw.id
    WHERE t.artwork_id IS NULL
      ${wherePublished}
    ORDER BY aw."createdAt" ASC
  `);
  return rows.map((r) => r.id);
}

async function getMissingArtworkImages(): Promise<MissingImageRow[]> {
  const wherePublished = INCLUDE_ONLY_PUBLISHED
    ? `AND aw.published = TRUE`
    : ``;
  const rows = await db.$queryRawUnsafe<MissingImageRow[]>(`
    SELECT
      ai."artworkId"   AS "artworkId",
      ai.id            AS "artworkImageId",
      ai.url           AS "url"
    FROM "ArtworkImage" ai
    JOIN "Artwork" aw
      ON aw.id = ai."artworkId"
    LEFT JOIN artwork_image_embeddings e
      ON e.artwork_image_id = ai.id
    WHERE e.artwork_image_id IS NULL
      ${wherePublished}
    ORDER BY aw."createdAt" ASC, ai.id ASC
  `);
  return rows;
}

async function processInBatches<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  label: string
) {
  console.log(`\n${label}: ${items.length} to process`);
  let done = 0,
    failed = 0;

  for (let i = 0; i < items.length; i += BATCH_CONCURRENCY) {
    const slice = items.slice(i, i + BATCH_CONCURRENCY);
    await Promise.all(
      slice.map(async (item) => {
        try {
          await worker(item);
          done++;
          if (done % LOG_EVERY === 0) {
            console.log(`${label}: ${done}/${items.length} done`);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          failed++;
          console.error(`${label} failed:`, e?.message ?? e);
        }
      })
    );
  }
  console.log(`${label}: completed=${done}, failed=${failed}`);
}

async function main() {
  console.log("Backfill starting…");

  const artistIds = await getMissingArtistIds();
  await processInBatches(artistIds, upsertArtistTextEmbedding, "Artist text");

  const artworkTextIds = await getMissingArtworkTextIds();
  await processInBatches(
    artworkTextIds,
    upsertArtworkTextEmbedding,
    "Artwork text"
  );

  const missingImages = await getMissingArtworkImages();
  await processInBatches(
    missingImages,
    async (row) => {
      if (!row.url) return;
      await upsertSingleArtworkImageEmbedding(
        row.artworkId,
        row.artworkImageId,
        row.url
      );
    },
    "Artwork image embeddings"
  );

  console.log("\nBackfill finished!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Backfill fatal error:", e);
    process.exit(1);
  });
