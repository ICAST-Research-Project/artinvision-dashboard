import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { db } from "@/lib/db";

export type ArtworkRow = {
  id: string;
  title: string;
  artist: string;
  categoryName: string;
  description: string;
};

async function getData(): Promise<ArtworkRow[]> {
  const artworks = await db.artwork.findMany({
    select: {
      id: true,
      title: true,
      artist: true,
      description: true,
      category: { select: { name: true } },
    },
    // orderBy: { createdAt: "desc" },
  });

  return artworks.map((a) => ({
    id: a.id,
    title: a.title,
    artist: a.artist,
    description: a.description,
    categoryName: a.category.name,
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
        <Button className="bg-blue-500" asChild>
          <Link href="/museum/artworks/new" className="text-white">
            + Add Artwork
          </Link>
        </Button>
      </div>
      <div className="mt-7 w-full overflow-hidden">
        <DataTable columns={columns} data={data} categories={categories} />
      </div>
    </section>
  );
};

export default Page;
