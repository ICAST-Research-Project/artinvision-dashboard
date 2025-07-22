"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ArtworkCarousel({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [idx, setIdx] = useState(0);
  const len = images.length;

  const prev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i - 1 + len) % len);
  };
  const next = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % len);
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-48 overflow-hidden rounded-lg">
        {images.map((img, i) => (
          <div
            key={i}
            className={`
              absolute inset-0
              transition-opacity duration-300
              ${i === idx ? "opacity-100" : "opacity-0"}
            `}
          >
            <Image
              src={img.url}
              alt={`${title} image ${i + 1}`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {len > 1 && (
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            type="button"
            onClick={prev}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
