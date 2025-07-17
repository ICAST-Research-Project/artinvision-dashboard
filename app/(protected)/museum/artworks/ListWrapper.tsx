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
  // 1️⃣ local React state for your rows
  const [data, setData] = useState<ArtworkRow[]>(initialData);

  // 2️⃣ callback for a single‐row toggle
  const handleToggle = (id: string, published: boolean) => {
    // optimistic update
    setData((rows) => rows.map((r) => (r.id === id ? { ...r, published } : r)));
    // persist change—no router.refresh()
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
