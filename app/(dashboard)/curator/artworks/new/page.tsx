import ArtworkForm from "@/components/curator/form/ArtworkForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <>
      <div className="flex justify-start pb-5">
        <Button asChild variant="secondary">
          <Link href="/curator/artworks">Go Back</Link>
        </Button>
      </div>
      <section className="w-full max-w-2xl">
        <ArtworkForm />
      </section>
    </>
  );
};

export default page;
