import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

import ListWrapper from "./ListWrapper";
import { getAllArtworks } from "@/actions/artwork";
import { db } from "@/lib/db";

export type ArtworkRow = {
  id: string;
  title: string;
  artist: string;
  categoryName: string;
  description: string;
  published: boolean;
};

async function getData(): Promise<ArtworkRow[]> {
  const artworks = await getAllArtworks();
  return artworks.map((a) => ({
    id: a.id,
    title: a.title,
    artist: a.artistRel?.name ?? "Unknown",
    description: a.description,
    categoryName: a.category.name,
    published: a.published,
  }));
}

async function getCategories(): Promise<string[]> {
  const cats = await db.category.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return cats.map((c) => c.name);
}

const Page = async () => {
  const data = await getData();
  const categories = await getCategories();
  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Artworks</h2>
        <div className="flex gap-2">
          <Button className="bg-blue-500" asChild>
            <Link href="/museum/artworks/new" className="text-white">
              + Add Artwork
            </Link>
          </Button>
        </div>
      </div>
      <ListWrapper initialData={data} categories={categories} />
    </section>
  );
};

export default Page;
