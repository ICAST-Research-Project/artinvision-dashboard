"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="w-full">
      <div className="relative w-full h-96 rounded-lg overflow-hidden">
        <Image
          src={images[index]}
          alt={`Artwork image ${index + 1}`}
          fill
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center mt-4 space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            aria-label="Previous image"
          >
            <ArrowLeft />
          </Button>

          <span className="text-sm text-muted-foreground">
            {index + 1} / {images.length}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={next}
            aria-label="Next image"
          >
            <ArrowRight />
          </Button>
        </div>
      )}

      {images.length > 1 && (
        <div className="flex justify-center mt-2 space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`h-2 w-2 rounded-full transition ${
                idx === index ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setIndex(idx)}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
