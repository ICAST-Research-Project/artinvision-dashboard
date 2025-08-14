import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CollectionForm from "@/components/curator/form/CollectionForm";
import {
  getCollectionById,
  fetchArtworks,
  fetchCategories,
  fetchMuseums,
  updateCollectionAction,
} from "@/actions/collections";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

const EditPage = async ({ params }: EditPageProps) => {
  const { id } = await params;
  const collection = await getCollectionById(id);
  const museums = await fetchMuseums();
  const artworks = await fetchArtworks();
  const categories = await fetchCategories();

  return (
    <div>
      <div className="flex justify-start pb-5">
        <Button asChild variant="secondary">
          <Link href="/curator/collections">Go Back</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Update Collection</h1>
      <CollectionForm
        initialData={collection}
        museums={museums}
        artworks={artworks}
        categories={categories}
        createCollection={updateCollectionAction}
      />
    </div>
  );
};

export default EditPage;
