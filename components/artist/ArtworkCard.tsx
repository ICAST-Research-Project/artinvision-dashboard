"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { TfiPencilAlt } from "react-icons/tfi";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Artwork } from "@prisma/client";
import { ArtworkCarousel } from "@/components/artist/ArtworkCarousel";
import { deleteArtworkByArtistById } from "@/actions/artwork";
import { toast } from "sonner";

interface ArtworkCardProps {
  art: Artwork & {
    images: { url: string }[];
    category: { name: string };
  };
}

export function ArtworkCard({ art }: ArtworkCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteArtworkByArtistById(art.id);
        router.refresh();
        toast("Artwork Deleted!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        toast("Something went wrong!");
      }
    });
  };

  return (
    <div className="relative">
      <Link
        href={`/artist/artworks/${art.id}`}
        className="block rounded-lg overflow-hidden border hover:shadow-lg"
      >
        {art.images.length > 1 ? (
          <ArtworkCarousel images={art.images} title={art.title} />
        ) : art.images[0]?.url ? (
          <div className="relative w-full h-48">
            <Image
              src={art.images[0].url}
              alt={art.title}
              fill
              className="object-contain"
            />
          </div>
        ) : null}

        <div className="p-4">
          <h2 className="text-lg font-semibold">{art.title}</h2>
          <p className="text-sm text-gray-500">{art.category.name}</p>
          <p className="mt-2 text-gray-700 line-clamp-3">{art.description}</p>
        </div>
      </Link>

      <Link
        href={`/artist/artworks/edit/${art.id}`}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 bg-green-500 bg-opacity-80 p-1 rounded hover:bg-opacity-100"
      >
        <TfiPencilAlt size={18} className="text-white" />
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        disabled={isPending}
        className="absolute top-10 right-2 bg-red-500 bg-opacity-80 p-1 rounded hover:bg-opacity-100 disabled:cursor-wait disabled:opacity-50"
      >
        {isPending ? (
          <Trash2 size={18} className="animate-spin text-white" />
        ) : (
          <Trash2 size={18} className="text-white" />
        )}
      </button>
    </div>
  );
}
