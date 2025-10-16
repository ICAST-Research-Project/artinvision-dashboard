"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const IMAGES = ["/demo/A1A1.png", "/demo/A4A1.png", "/demo/A9A1.png"];

export default function Page() {
  const [idx, setIdx] = useState(0);

  const next = useCallback(() => setIdx((i) => (i + 1) % IMAGES.length), []);
  const prev = useCallback(
    () => setIdx((i) => (i - 1 + IMAGES.length) % IMAGES.length),
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="min-h-screen w-full relative bg-white">
      <button
        onClick={prev}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 px-6 py-3 text-3xl rounded-full border  bg-white hover:bg-gray-50"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-20 px-6 py-3 text-3xl rounded-full border shadow bg-white hover:bg-gray-50"
        aria-label="Next"
      >
        ›
      </button>

      <div className="mx-auto max-w-[1920px] px-0 py-8">
        <div className="relative w-full h-[95vh] max-h-[1200px] overflow-hidden">
          <Image
            key={IMAGES[idx]}
            src={IMAGES[idx]}
            alt={`Slide ${idx + 1}`}
            fill
            className="object-contain transition-opacity duration-300"
            priority
          />
        </div>

        {/* Dots */}
        {/* <div className="mt-5 flex justify-center gap-3">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-3.5 w-3.5 rounded-full ${
                i === idx ? "bg-black" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
}
