"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type FilterValue = "all" | "self" | "others";

export function ArtworkFilterSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = (searchParams.get("filter") ?? "all") as FilterValue;

  const onValueChange = (next: FilterValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="artwork-filter" className="w-[200px]">
          <SelectValue placeholder="Filter artworks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="self">I’m the artist</SelectItem>
          <SelectItem value="others">Other artists</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
