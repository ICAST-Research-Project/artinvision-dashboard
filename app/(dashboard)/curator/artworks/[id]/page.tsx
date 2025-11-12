import React from "react";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/actions/artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ArtworkImagesPanel from "./ArtworkImagesPanel";
import ActionsBar from "./ActionsBar";

export const dynamic = "force-dynamic";

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const art = await getArtworkById(id).catch(() => null);
  if (!art) notFound();

  const images = art.rest.images?.map((i: { url: string }) => i.url) ?? [];

  return (
    <div className="w-full px-4 lg:px-6">
      {" "}
      {/* left-anchored container */}
      {/* Top row: Back (left) + Edit/Delete (right) */}
      <div className="flex items-center justify-between pb-4">
        <Button asChild variant="secondary">
          <Link href="/curator/artworks">Go Back</Link>
        </Button>
        <ActionsBar artworkId={art.rest.id} />
      </div>
      {/* Two-column layout: fluid left + fixed right */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left: details */}
        <main className="space-y-4">
          <h1 className="text-3xl font-bold">Title: {art.rest.title}</h1>
          <Badge variant="secondary">{art.rest.category.name}</Badge>

          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Artist Name:</h2>
            <span className="text-lg text-muted-foreground">
              {art.rest.artistRel?.name}
            </span>
          </div>

          <h2 className="font-semibold">Description:</h2>
          <p className="text-base leading-relaxed text-left">
            {art.rest.description}
          </p>
        </main>

        {/* Right: images */}
        <aside>
          <h2 className="mb-3 font-semibold">Artwork Images</h2>
          <ArtworkImagesPanel images={images} />
        </aside>
      </div>
    </div>
  );
}
