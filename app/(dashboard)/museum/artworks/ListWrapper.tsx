"use client";

import React, { useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { toggleArtworkPublished } from "@/actions/artwork";
import type { ArtworkRow } from "./page";

export default function ListWrapper({
  initialData,
  categories,
}: {
  initialData: ArtworkRow[];
  categories: string[];
}) {
  const [data, setData] = useState<ArtworkRow[]>(initialData);

  const handleToggle = (id: string, published: boolean) => {
    setData((rows) => rows.map((r) => (r.id === id ? { ...r, published } : r)));
    toggleArtworkPublished(id, published);
  };

  return (
    <div className="mt-7 w-full overflow-hidden">
      <DataTable
        columns={columns({ onToggle: handleToggle })}
        data={data}
        categories={categories}
      />
    </div>
  );
}
