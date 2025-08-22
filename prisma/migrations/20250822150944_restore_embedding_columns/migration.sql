-- TEXT embeddings (1536 dims)
ALTER TABLE artwork_embeddings_text
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE artist_embeddings_text
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- IMAGE embeddings (512 dims)
ALTER TABLE artwork_embeddings_image
  ADD COLUMN IF NOT EXISTS embedding vector(512);

-- Recreate ANN indexes if needed (safe to re-run)
DROP INDEX IF EXISTS artwork_embeddings_text_cos_idx;
CREATE INDEX IF NOT EXISTS artwork_embeddings_text_cos_idx
  ON artwork_embeddings_text USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

DROP INDEX IF EXISTS artist_embeddings_text_cos_idx;
CREATE INDEX IF NOT EXISTS artist_embeddings_text_cos_idx
  ON artist_embeddings_text USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

DROP INDEX IF EXISTS artwork_embeddings_image_cos_idx;
CREATE INDEX IF NOT EXISTS artwork_embeddings_image_cos_idx
  ON artwork_embeddings_image USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
