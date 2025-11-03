import React from "react";
import Link from "next/link";
import { getAllArtworks, type ArtworkFilter } from "@/actions/artwork";
import type { Artwork } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/curator/ArtworkCard";
import { ArtworkFilterSelect } from "@/components/curator/ArtworkFilterSelect";

type PageProps = {
  searchParams: Promise<{
    filter?: "all" | "self" | "others";
  }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const sp = await searchParams;
  const f = sp?.filter;
  const filter: ArtworkFilter =
    f === "self" || f === "others" || f === "all" ? f : "all";

  const artworks = await getAllArtworks(filter);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between pb-4 gap-3">
        <h1 className="text-3xl font-bold">Artworks</h1>
        <div className="flex items-center gap-3">
          <ArtworkFilterSelect />
          <Button className="bg-blue-500" asChild>
            <Link href="/curator/artworks/new" className="text-white">
              + Add Artwork
            </Link>
          </Button>
        </div>
      </div>
  
      <div className="mb-4">
        <ul role="list" className="mt-2 space-y-8 text-gray-600 text-justify">
          <li className="flex gap-x-3">
            <span>
              Here, you will able to upload new artowrks and manage all of the
              artworks uploaded by this account.
            </span>
          </li>
          <li className="flex gap-x-3">
            <span>
              <strong className="font-semibold text-gray-900">
                Add Artworks:
              </strong>{" "}
              you will able to upload new artowrks.
            </span>
          </li>
        </ul>
      </div>

      {artworks.length === 0 ? (
        <p className="text-gray-600">
          No artworks match this filter.{" "}
          <Link
            href="/curator/artworks/new"
            className="text-blue-500 underline"
          >
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
