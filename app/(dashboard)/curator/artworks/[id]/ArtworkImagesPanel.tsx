"use client";

import ImageCarousel from "./ImageCarousel";

export default function ArtworkImagesPanel({ images }: { images: string[] }) {
  return images?.length ? (
    <ImageCarousel images={images} />
  ) : (
    <p className="text-sm text-muted-foreground">No images uploaded.</p>
  );
}
