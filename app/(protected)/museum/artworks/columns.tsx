"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

export type ArtworkRow = {
  id: string;
  title: string;
  artist: string;
  categoryName: string;
  description: string;
};

export const columns: ColumnDef<ArtworkRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/museum/artworks/${row.original.id}`}
        className="text-blue-500"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "artist",
    header: "Artist Name",
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
];
