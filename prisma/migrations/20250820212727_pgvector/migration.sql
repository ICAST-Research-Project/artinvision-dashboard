/*
  Warnings:

  - You are about to drop the `artist_embeddings_text` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `artwork_embeddings_image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `artwork_embeddings_text` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "artist_embeddings_text" DROP CONSTRAINT "artist_embeddings_text_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "artwork_embeddings_image" DROP CONSTRAINT "artwork_embeddings_image_artwork_id_fkey";

-- DropForeignKey
ALTER TABLE "artwork_embeddings_text" DROP CONSTRAINT "artwork_embeddings_text_artwork_id_fkey";

-- DropTable
DROP TABLE "artist_embeddings_text";

-- DropTable
DROP TABLE "artwork_embeddings_image";

-- DropTable
DROP TABLE "artwork_embeddings_text";
