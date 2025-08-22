/*
  Warnings:

  - You are about to drop the column `embedding` on the `artist_embeddings_text` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `artwork_embeddings_image` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `artwork_embeddings_text` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "artist_embeddings_text_cos_idx";

-- DropIndex
DROP INDEX "artwork_embeddings_image_cos_idx";

-- DropIndex
DROP INDEX "artwork_embeddings_text_cos_idx";

-- AlterTable
ALTER TABLE "artist_embeddings_text" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "artwork_embeddings_image" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "artwork_embeddings_text" DROP COLUMN "embedding";
