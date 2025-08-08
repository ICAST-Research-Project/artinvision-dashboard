"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { PenBoxIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CollectionSummary } from "@/actions/collections";
import { deleteCollection } from "@/actions/collections";

export type Collection = CollectionSummary;

export const columns: ColumnDef<Collection>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/curator/collections/${row.original.id}`}
        className="text-blue-600 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "about",
    header: "About",
    cell: ({ row }) => {
      const full = row.original.about;
      const truncated = full.length > 15 ? full.slice(0, 50) + "…" : full;
      return <span>{truncated}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const colorClass =
        status === "APPROVED"
          ? "text-green-600"
          : status === "REJECTED"
            ? "text-red-600"
            : status === "COMPLETED"
              ? "text-blue-500"
              : "text-yellow-600";

      return <span className={`capitalize ${colorClass}`}>{status}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      const status = row.original.status;
      const isEditable = status !== "COMPLETED";

      const onDelete = async () => {
        if (!confirm(`Delete “${row.original.name}”?`)) return;
        try {
          await deleteCollection(row.original.id);
          router.refresh();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          alert(err.message || "Failed to delete");
        }
      };

      return (
        <div className="flex flex-row items-center space-x-2">
          {isEditable ? (
            <Link
              href={`/curator/collections/edit/${row.original.id}`}
              className="p-1 rounded hover:bg-green-200"
            >
              <PenBoxIcon className="h-4 w-4 text-green-500" />
            </Link>
          ) : (
            <div
              className="p-1 rounded cursor-not-allowed opacity-50"
              title="Cannot edit a completed collection"
            >
              <PenBoxIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-100"
            aria-label="Delete collection"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      );
    },
  },
];
