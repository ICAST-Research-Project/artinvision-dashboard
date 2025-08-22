// Command to run this file: npm run backfill:embeddings
import { db } from "@/lib/db";
import {
  upsertArtistTextEmbedding,
  upsertArtworkImageEmbedding,
  upsertArtworkTextEmbedding,
} from "@/lib/upsert-embeddings";

const BATCH = 5;
const INCLUDE_ONLY_PUBLISHED = false;

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

async function getMissingArtworkImageIds(): Promise<string[]> {
  const wherePublished = INCLUDE_ONLY_PUBLISHED
    ? `AND aw.published = TRUE`
    : ``;
  const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(`
    SELECT aw.id
    FROM "Artwork" aw
    LEFT JOIN artwork_embeddings_image i ON i.artwork_id = aw.id
    WHERE i.artwork_id IS NULL
      ${wherePublished}
      AND EXISTS (SELECT 1 FROM "ArtworkImage" im WHERE im."artworkId" = aw.id)
    ORDER BY aw."createdAt" ASC
  `);
  return rows.map((r) => r.id);
}

async function processInBatches<T>(
  ids: T[],
  fn: (id: T) => Promise<void>,
  label: string
) {
  console.log(`\n${label}: ${ids.length} to process`);
  let done = 0,
    failed = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (id) => {
        try {
          await fn(id);
          done++;
          if (done % 25 === 0)
            console.log(`${label}: ${done}/${ids.length} done`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          failed++;
          console.error(`${label} failed for id=${id}:`, e?.message ?? e);
        }
      })
    );
  }
  console.log(`${label}: completed=${done}, failed=${failed}`);
}

async function main() {
  console.log("Backfill starting…");

  // Artists (artwork text includes artist info)
  const artistIds = await getMissingArtistIds();
  await processInBatches(artistIds, upsertArtistTextEmbedding, "Artist text");

  // Artwork TEXT
  const artworkTextIds = await getMissingArtworkTextIds();
  await processInBatches(
    artworkTextIds,
    upsertArtworkTextEmbedding,
    "Artwork text"
  );

  //Artwork IMAGE
  const artworkImageIds = await getMissingArtworkImageIds();
  await processInBatches(
    artworkImageIds,
    upsertArtworkImageEmbedding,
    "Artwork image"
  );

  console.log("\nBackfill finished!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Backfill fatal error:", e);
    process.exit(1);
  });
