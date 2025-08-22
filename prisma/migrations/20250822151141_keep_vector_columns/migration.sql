/*
  Warnings:

  - Added the required column `embedding` to the `artist_embeddings_text` table without a default value. This is not possible if the table is not empty.
  - Added the required column `embedding` to the `artwork_embeddings_image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `embedding` to the `artwork_embeddings_text` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "artist_embeddings_text" ADD COLUMN     "embedding" vector NOT NULL;

-- AlterTable
ALTER TABLE "artwork_embeddings_image" ADD COLUMN     "embedding" vector NOT NULL;

-- AlterTable
ALTER TABLE "artwork_embeddings_text" ADD COLUMN     "embedding" vector NOT NULL;
