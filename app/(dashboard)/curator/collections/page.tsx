import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-wrap justify-between pb-4">
      <h1 className="text-3xl font-bold mb-6">My Collections</h1>
      <Button className="bg-blue-500" asChild>
        <Link href="/curator/collections/new" className="text-white">
          + Create Collections
        </Link>
      </Button>
    </div>
  );
};

export default page;
