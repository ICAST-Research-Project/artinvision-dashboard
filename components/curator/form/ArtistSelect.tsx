"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listArtists, createArtistQuick } from "@/actions/artist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function ArtistSelect({
  value,
  onChange,
  placeholder = "Select artist",
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // quick-create dialog state
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newBio, setNewBio] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const rows = await listArtists(search);
        if (alive) setOptions(rows);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load artists");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [search]);

  async function handleCreate() {
    if (!newName.trim() || !newBio.trim()) {
      toast.error("Please enter name and bio");
      return;
    }
    const res = await createArtistQuick({
      name: newName.trim(),
      bio: newBio.trim(),
    });
    if (!res?.success || !res.data) {
      toast.error("Failed to create artist");
      return;
    }
    toast.success("Artist created");
    const created = res.data;
    setOptions((prev) => [{ id: created.id, name: created.name }, ...prev]);
    onChange(created.id);
    setCreateOpen(false);
    setOpen(false);
    setNewName("");
    setNewBio("");
  }

  const selected = options.find((opt) => opt.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected ? selected.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        {/* Force it to open below the trigger and align to the left edge */}
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput
              placeholder="Search artists…"
              value={search}
              onValueChange={setSearch}
            />

            {/* Scrollable list: ~5 items tall */}
            <CommandList className="max-h-56 overflow-y-auto">
              <CommandEmpty>
                {loading ? "Loading…" : "No artist found."}
              </CommandEmpty>

              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.name}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              {/* Keep the create action visible at the bottom */}
              <div className="sticky bottom-0 bg-background p-1 border-t">
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create new artist
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Create new artist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm">Name</label>
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm">Bio</label>
                        <Textarea
                          value={newBio}
                          onChange={(e) => setNewBio(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setCreateOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreate}>Create</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
