/*
  Warnings:

  - You are about to drop the column `background` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `Artist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "background",
DROP COLUMN "education";
