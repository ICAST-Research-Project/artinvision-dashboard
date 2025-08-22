-- CreateTable
CREATE TABLE "artwork_embeddings_text" (
    "artwork_id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artwork_embeddings_text_pkey" PRIMARY KEY ("artwork_id")
);

-- CreateTable
CREATE TABLE "artwork_embeddings_image" (
    "artwork_id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artwork_embeddings_image_pkey" PRIMARY KEY ("artwork_id")
);

-- CreateTable
CREATE TABLE "artist_embeddings_text" (
    "artist_id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_embeddings_text_pkey" PRIMARY KEY ("artist_id")
);

-- AddForeignKey
ALTER TABLE "artwork_embeddings_text" ADD CONSTRAINT "artwork_embeddings_text_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artwork_embeddings_image" ADD CONSTRAINT "artwork_embeddings_image_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_embeddings_text" ADD CONSTRAINT "artist_embeddings_text_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
