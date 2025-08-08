/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { updateCollectionStatus } from "@/actions/collections";
import type { CollectionRequest } from "@/actions/collections";
import Link from "next/link";

export const columns: ColumnDef<CollectionRequest>[] = [
  {
    accessorKey: "curatorName",
    header: "Curator Name",
  },
  {
    accessorKey: "name",
    header: "Collection Name",
    cell: ({ row }) => (
      <Link
        href={`/museum/requests/${row.original.id}`}
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
      const current = row.original.status;

      const onChange = async (newStatus: string) => {
        if (newStatus === current) return;
        try {
          await updateCollectionStatus(row.original.id, newStatus as any);
          router.refresh();
        } catch (err: any) {
          alert(err.message || "Failed to update status");
        }
      };

      return (
        <Select value={current} onValueChange={onChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approve</SelectItem>
            <SelectItem value="REJECTED">Reject</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
];
