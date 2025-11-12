import React from "react";
import { getArtworkById } from "@/actions/artwork";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import ArtworkForm from "@/components/curator/form/ArtworkForm";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

const EditPage = async ({ params }: EditPageProps) => {
  const { id } = await params;
  const art = await getArtworkById(id);

  const meAsArtist = art.meAsArtistSuggested; // ← from action

  return (
    <div>
      <div className="flex justify-start pb-5">
        <Button asChild variant="secondary">
          <Link href="/curator/artworks">Go Back</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Update Artwork</h1>
      <ArtworkForm
        id={id}
        initialValues={{
          title: art.rest.title,
          description: art.rest.description,
          categoryId: art.rest.category.id,
          imageUrls: art.rest.images.map((i) => i.url),
          artistId: meAsArtist ? "" : (art.rest.artistId ?? ""),
          meAsArtist,
        }}
      />
    </div>
  );
};

export default EditPage;
