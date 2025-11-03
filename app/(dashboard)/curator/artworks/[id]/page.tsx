import React from "react";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/actions/artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ImageCarousel from "./ImageCarousel";
import { IoMdDownload } from "react-icons/io";
import { CiLocationArrow1 } from "react-icons/ci";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const art = await getArtworkById(id).catch(() => null);
  if (!art) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-start pb-1">
        <Button asChild variant="secondary">
          <Link href="/curator/artworks">Go Back</Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Title: {art.title}</h1>
      <Badge variant="secondary">{art.category.name}</Badge>

      <div className="flex items-center gap-2">
        <h1 className="font-semibold">Artist Name:</h1>
        <span className="text-lg text-muted-foreground">
          {art.artistRel?.name}
        </span>
      </div>

      <h1 className="font-semibold">Description:</h1>
      <p className="text-base leading-relaxed text-justify">
        {art.description}
      </p>

      {/* QR section */}
      {art.qrCodeUrl ? (
        <section className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">QR Code</h3>
          <div className="flex items-center gap-16">
            <Image
              src={art.qrCodeUrl}
              alt={`QR for ${art.title}`}
              className="rounded-md border bg-white"
              width={200}
              height={200}
            />
            <div className="flex flex-row gap-6">
              <a
                href={`/api/qr/download?aid=${art.id}`}
                download={`artwork-${art.id}-qr.png`}
                className="inline-flex gap-3 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Download <IoMdDownload size={25} className="mt-1" />
              </a>
              <a
                href={art.qrCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex gap-3 items-center justify-center rounded-md border px-4 py-2 hover:bg-gray-50"
              >
                Open in new tab <CiLocationArrow1 size={25} className="mt-1" />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          QR code not generated yet.
        </p>
      )}
      {/* ArtworkImages section */}
      <h1 className="font-semibold">Artwork Images:</h1>
      {art.images.length > 0 && (
        <ImageCarousel images={art.images.map((i) => i.url)} />
      )}
    </div>
  );
}
