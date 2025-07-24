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

export const columns: ColumnDef<CollectionRequest>[] = [
  {
    accessorKey: "curatorName",
    header: "Curator Name",
  },
  {
    accessorKey: "name",
    header: "Collection Name",
  },

  {
    accessorKey: "about",
    header: "About",
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
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
];
