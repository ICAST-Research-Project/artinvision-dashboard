import {
  createCollectionAction,
  fetchArtworks,
  fetchCategories,
  fetchMuseums,
} from "@/actions/collections";
import CollectionForm from "@/components/curator/form/CollectionForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export type Museum = { id: string; museumName: string };
export type Artwork = Awaited<ReturnType<typeof fetchArtworks>>[0];
export type Category = Awaited<ReturnType<typeof fetchCategories>>[0];

const Page = async () => {
  const [museums, artworks, categories] = await Promise.all([
    fetchMuseums(),
    fetchArtworks(),
    fetchCategories(),
  ]);

  return (
    <>
      <div className="flex justify-start pb-5">
        <Button asChild variant="secondary">
          <Link href="/curator/collections">Go Back</Link>
        </Button>
      </div>
      <section className="w-full">
        <CollectionForm
          museums={museums}
          artworks={artworks}
          categories={categories}
          createCollection={createCollectionAction}
        />
      </section>
    </>
  );
};

export default Page;
