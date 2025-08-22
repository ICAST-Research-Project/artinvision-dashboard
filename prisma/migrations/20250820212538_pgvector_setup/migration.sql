CREATE EXTENSION IF NOT EXISTS vector;

-- Text embeddings for artworks
CREATE TABLE IF NOT EXISTS artwork_embeddings_text (
  artwork_id TEXT PRIMARY KEY
    REFERENCES "Artwork"(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS artwork_embeddings_text_cos_idx
  ON artwork_embeddings_text USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Image embeddings for artworks
CREATE TABLE IF NOT EXISTS artwork_embeddings_image (
  artwork_id TEXT PRIMARY KEY
    REFERENCES "Artwork"(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'clip-vit-base-patch32',
  embedding VECTOR(512) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS artwork_embeddings_image_cos_idx
  ON artwork_embeddings_image USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Text embeddings for artists
CREATE TABLE IF NOT EXISTS artist_embeddings_text (
  artist_id TEXT PRIMARY KEY
    REFERENCES "Artist"(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS artist_embeddings_text_cos_idx
  ON artist_embeddings_text USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
