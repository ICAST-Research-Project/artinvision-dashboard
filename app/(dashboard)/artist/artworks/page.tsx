import React from "react";
import Link from "next/link";
import { getAllArtworks } from "@/actions/artwork";
import type { Artwork } from "@prisma/client";
import { ArtworkCard } from "@/components/artist/ArtworkCard";
import { Button } from "@/components/ui/button";

const Page = async () => {
  const artworks = await getAllArtworks();

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between pb-4">
        <h1 className="text-3xl font-bold mb-6">My Artworks</h1>
        <Button className="bg-blue-500" asChild>
          <Link href="/artist/artworks/new" className="text-white">
            + Add Artwork
          </Link>
        </Button>
      </div>
      {artworks.length === 0 ? (
        <p className="text-gray-600">
          You haven’t added any artwork yet.{" "}
          <Link href="/artist/artworks/new" className="text-blue-500 underline">
            Create one now
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map(
            (
              art: Artwork & {
                images: { url: string }[];
                category: { name: string };
              }
            ) => (
              <ArtworkCard key={art.id} art={art} />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
