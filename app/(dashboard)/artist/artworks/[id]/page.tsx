import React from "react";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/actions/artwork";
import ImageCarousel from "./ImageCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ArtworkPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let art;
  try {
    art = await getArtworkById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl   space-y-6">
      <div className="flex justify-start pb-1">
        <Button asChild variant="secondary">
          <Link href="/artist/artworks">Go Back</Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold">Title: {art.rest.title}</h1>
      <Badge variant="secondary">{art.rest.category.name}</Badge>
      <div className="flex items-center gap-2">
        <h1 className="font-semibold">Artist Name: </h1>
        <span className="text-lg text-muted-foreground">
          {art.rest.artistRel?.name}
        </span>
      </div>

      <h1 className="font-semibold">Description:</h1>
      <p className="text-base leading-relaxed">{art.rest.description}</p>
      <h1 className="font-semibold">Artwork Images:</h1>
      {art.rest.images.length > 0 && (
        <ImageCarousel images={art.rest.images.map((i) => i.url)} />
      )}
    </div>
  );
}
