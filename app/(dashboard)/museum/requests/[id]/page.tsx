import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getCollectionById } from "@/actions/collections";
import { ArtworkCarousel } from "@/components/curator/ArtworkCarousel";
import { CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-start pb-1">
        <Button asChild variant="secondary">
          <Link href="/museum/requests">Go Back</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold">{collection.name}</h1>
      <div className="flex flex-row gap-2">
        <h1>Status:</h1>
        <Badge variant="secondary"> {collection.status}</Badge>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-semibold">Curator Name:</h2>
          <p className="text-lg text-muted-foreground">
            {collection.curator.user.name}
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold">About:</h2>
        <p className="text-base leading-relaxed">{collection.about}</p>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Artworks in this collection:</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {collection.artworkLinks.map(({ artwork }) => (
            <div
              key={artwork.id}
              className="bg-white block rounded-lg shadow hover:shadow-xl
                transform hover:scale-105
                transition-all duration-300
                overflow-hidden"
            >
              {artwork.images.length > 0 && (
                <div className="relative w-full h-48">
                  <ArtworkCarousel
                    images={artwork.images}
                    title={artwork.title}
                  />
                </div>
              )}
              <CardContent className="p-4 mt-6">
                <h3 className="text-lg font-semibold mb-1 truncate">
                  {artwork.title}
                </h3>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline">{artwork.category.name}</Badge>
                  <span className="text-orange-600 italic px-2 py-1 text-xs">
                    {artwork.artistId}
                  </span>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
