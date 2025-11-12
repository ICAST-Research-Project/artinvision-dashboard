"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { TfiPencilAlt } from "react-icons/tfi";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteArtworkByCuratorId } from "@/actions/artwork";

export default function ActionsBar({ artworkId }: { artworkId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteArtworkByCuratorId(artworkId);
        toast.success("Artwork deleted");
        router.push("/curator/artworks");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" className="bg-green-500">
        <Link href={`/curator/artworks/edit/${artworkId}`}>
          <TfiPencilAlt className="mr-2 h-4 w-4 " />
          Edit
        </Link>
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="mr-2 h-4 w-4" />
        )}
        Delete
      </Button>
    </div>
  );
}
