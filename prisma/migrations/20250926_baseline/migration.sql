-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('MUSEUM_ADMIN', 'CURATOR', 'ARTIST');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE
    "Artist" (
        "id" TEXT NOT NULL,
        "userId" TEXT,
        "address" TEXT,
        "bio" TEXT NOT NULL,
        "connect" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "name" TEXT NOT NULL,
        CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "Artwork" (
        "id" TEXT NOT NULL,
        "title" VARCHAR(100) NOT NULL,
        "description" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "published" BOOLEAN NOT NULL DEFAULT true,
        "createdById" TEXT NOT NULL,
        "creatorType" "AccountType" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "artistId" TEXT NOT NULL,
        CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "ArtworkImage" (
        "id" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "artworkId" TEXT NOT NULL,
        CONSTRAINT "ArtworkImage_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "Category" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "Collection" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "about" TEXT NOT NULL,
        "museumAdminId" TEXT NOT NULL,
        "curatorId" TEXT NOT NULL,
        "status" "CollectionStatus" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "CollectionArtwork" (
        "collectionId" TEXT NOT NULL,
        "artworkId" TEXT NOT NULL,
        CONSTRAINT "CollectionArtwork_pkey" PRIMARY KEY ("collectionId", "artworkId")
    );

-- CreateTable
CREATE TABLE
    "Curator" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "about" TEXT NOT NULL,
        "connect" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Curator_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "MuseumAdmin" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "museumName" TEXT NOT NULL,
        "about" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "MuseumAdmin_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "PasswordResetToken" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "User" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "password" TEXT,
        "accountType" "AccountType" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "VerificationToken" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "artist_embeddings_text" (
        "artist_id" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "embedding" vector NOT NULL,
        CONSTRAINT "artist_embeddings_text_pkey" PRIMARY KEY ("artist_id")
    );

-- CreateTable
CREATE TABLE
    "artwork_embeddings_image" (
        "artwork_id" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "embedding" vector NOT NULL,
        CONSTRAINT "artwork_embeddings_image_pkey" PRIMARY KEY ("artwork_id")
    );

-- CreateTable
CREATE TABLE
    "artwork_embeddings_text" (
        "artwork_id" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "embedding" vector NOT NULL,
        CONSTRAINT "artwork_embeddings_text_pkey" PRIMARY KEY ("artwork_id")
    );

-- CreateTable
CREATE TABLE
    "artwork_image_embeddings" (
        "artwork_image_id" TEXT NOT NULL,
        "artwork_id" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "embedding" vector,
        "created_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ (6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "artwork_image_embeddings_pkey" PRIMARY KEY ("artwork_image_id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist" ("userId" ASC);

-- CreateIndex
CREATE INDEX "Artwork_artistId_idx" ON "Artwork" ("artistId" ASC);

-- CreateIndex
CREATE INDEX "Artwork_categoryId_idx" ON "Artwork" ("categoryId" ASC);

-- CreateIndex
CREATE INDEX "Artwork_published_idx" ON "Artwork" ("published" ASC);

-- CreateIndex
CREATE INDEX "ArtworkImage_artworkId_idx" ON "ArtworkImage" ("artworkId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category" ("name" ASC);

-- CreateIndex
CREATE INDEX "CollectionArtwork_artworkId_idx" ON "CollectionArtwork" ("artworkId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Curator_userId_key" ON "Curator" ("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "MuseumAdmin_userId_key" ON "MuseumAdmin" ("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken" ("email" ASC, "token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken" ("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_token_key" ON "VerificationToken" ("email" ASC, "token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken" ("token" ASC);

-- CreateIndex
CREATE INDEX "artwork_embeddings_image_vec_cos_idx" ON "artwork_embeddings_image" ("embedding" ASC);

-- CreateIndex
CREATE INDEX "artwork_image_embeddings_artwork_id_idx" ON "artwork_image_embeddings" ("artwork_id" ASC);

-- CreateIndex
CREATE INDEX "artwork_image_embeddings_vec_cos_idx" ON "artwork_image_embeddings" ("embedding" ASC);

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkImage" ADD CONSTRAINT "ArtworkImage_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_museumAdminId_fkey" FOREIGN KEY ("museumAdminId") REFERENCES "MuseumAdmin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionArtwork" ADD CONSTRAINT "CollectionArtwork_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionArtwork" ADD CONSTRAINT "CollectionArtwork_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curator" ADD CONSTRAINT "Curator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuseumAdmin" ADD CONSTRAINT "MuseumAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_embeddings_text" ADD CONSTRAINT "artist_embeddings_text_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artwork_embeddings_image" ADD CONSTRAINT "artwork_embeddings_image_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "Artwork" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artwork_embeddings_text" ADD CONSTRAINT "artwork_embeddings_text_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "Artwork" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artwork_image_embeddings" ADD CONSTRAINT "artwork_image_embeddings_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "Artwork" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "artwork_image_embeddings" ADD CONSTRAINT "artwork_image_embeddings_artwork_image_id_fkey" FOREIGN KEY ("artwork_image_id") REFERENCES "ArtworkImage" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;