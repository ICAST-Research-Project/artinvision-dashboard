"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";

export type ArtworkRow = {
  id: string;
  title: string;
  artist: string;
  categoryName: string;
  description: string;
  published: boolean;
};

type ColumnsOpts = {
  onToggle: (id: string, published: boolean) => void;
};

export const columns = ({ onToggle }: ColumnsOpts): ColumnDef<ArtworkRow>[] => [
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
  { accessorKey: "description", header: "Description" },
  { accessorKey: "artist", header: "Artist Name" },
  { accessorKey: "categoryName", header: "Category" },
  {
    id: "published",
    header: "Status",
    accessorKey: "published",
    filterFn: "equals",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isPending, startTransition] = useTransition();
      const { id, published } = row.original;
      return (
        <Switch
          checked={published}
          disabled={isPending}
          onCheckedChange={(val) =>
            startTransition(() => {
              onToggle(id, val);
            })
          }
        />
      );
    },
  },
];
