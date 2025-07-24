import ArtworkForm from "@/components/artist/form/ArtworkForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <>
      <div className="flex justify-start pb-5">
        <Button asChild variant="secondary">
          <Link href="/artist/artworks">Go Back</Link>
        </Button>
      </div>
      <h1 className="font-extrabold pb-4 mt-3">New Artwork</h1>
      <section className="w-full max-w-2xl">
        <ArtworkForm />
      </section>
    </>
  );  
}; 
   
export default page;
