"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectionSchema } from "@/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ArtworkCarousel } from "@/components/artist/ArtworkCarousel";

import type {
  createCollectionAction,
  fetchArtworks,
  fetchCategories,
  fetchMuseums,
  getCollectionById,
} from "@/actions/collections";

export type CreateCollectionInput = Parameters<
  typeof createCollectionAction
>[0];
export type Museum = Awaited<ReturnType<typeof fetchMuseums>>[0];
export type Category = Awaited<ReturnType<typeof fetchCategories>>[0];
export type Artwork = Awaited<ReturnType<typeof fetchArtworks>>[0];

interface CollectionInputWithOptionalId extends CreateCollectionInput {
  id: string;
  name: string;
  about: string;
  museumAdminId: string;
  artworkIds: string[];
}

interface Props {
  museums: Museum[];
  artworks: Artwork[];
  categories: Category[];
  createCollection: (
    input: CollectionInputWithOptionalId
  ) => Promise<{ id: string }>;
  initialData?: Awaited<ReturnType<typeof getCollectionById>>;
}

const CollectionForm: React.FC<Props> = ({
  museums,
  artworks,
  categories,
  createCollection,
  initialData,
}) => {
  const router = useRouter();
  const [filterCat, setFilterCat] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialData?.artworkLinks.map((l) => l.artwork.id) || [])
  );

  const form = useForm<CreateCollectionInput>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: initialData?.name || "",
      about: initialData?.about || "",
      museumAdminId: initialData?.museumAdmin.id || "",
      artworkIds: initialData?.artworkLinks.map((l) => l.artwork.id) || [],
    },
  });

  React.useEffect(() => {
    if (initialData?.artworkLinks) {
      const initialIds = new Set(
        initialData.artworkLinks.map((link) => link.artwork.id)
      );
      setSelected(initialIds);
      form.setValue("artworkIds", Array.from(initialIds));
    }
  }, []);

  React.useEffect(() => {
    form.setValue("artworkIds", Array.from(selected));
  }, [selected, form]);

  const originalSelectedIds = React.useMemo(() => {
    return new Set(initialData?.artworkLinks.map((l) => l.artwork.id) || []);
  }, [initialData]);

  const onSubmit = async (values: CreateCollectionInput) => {
    try {
      const { id } = await createCollection({
        ...values,
        id: initialData?.id ?? "", // pass ID only during update, ensure string
      });
      toast.success(
        initialData
          ? "Collection Updated successfully!"
          : "Collection Created successfully!"
      );
      router.push(`/curator/collections/${id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to submit collection");
    }
  };

  const filtered = filterCat
    ? artworks.filter((a) => a.categoryId === filterCat)
    : artworks;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between">
          <h1 className="font-extrabold text-2xl justify-between mt-2">
            Add Collection
          </h1>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Request Approval
          </button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Collection Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="About" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="museumAdminId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Museum for this collection</FormLabel>
              <FormControl>
                <select
                  {...field}
                  required
                  className="border p-2 rounded w-full max-w-xs"
                >
                  <option value="">Select a museum…</option>
                  {museums.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.museumName}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <h1 className="font-extrabold mt-2">
            Select Artworks for this Collection
          </h1>
          <div className="flex items-center space-x-2">
            <label className="font-medium">Filter by Category:</label>
            <select
              className="border p-2 rounded w-48"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((art) => {
            const wasOriginallySelected = originalSelectedIds.has(art.id);

            const isUnavailable = art.artworkLinks.some(
              (link) => link.collection.status !== "COMPLETED"
            );

            const isDisabled = isUnavailable && !wasOriginallySelected;

            return (
              <div
                key={art.id}
                className="bg-white block rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="relative w-full h-48">
                  {art.images.length > 1 ? (
                    <ArtworkCarousel images={art.images} title={art.title} />
                  ) : art.images[0]?.url ? (
                    <Image
                      src={art.images[0].url}
                      alt={art.title}
                      fill
                      className="object-contain"
                    />
                  ) : null}

                  <label className="absolute top-2 right-2  bg-opacity-75 p-2 rounded-full z-10">
                    <input
                      type="checkbox"
                      checked={selected.has(art.id)}
                      disabled={isDisabled}
                      onChange={(e) => {
                        setSelected((prevSelected) => {
                          const updated = new Set(prevSelected);
                          if (e.target.checked) {
                            updated.add(art.id);
                          } else {
                            updated.delete(art.id);
                          }
                          return new Set(updated);
                        });
                      }}
                      className="w-6 h-6"
                    />
                  </label>
                </div>

                <CardContent className="p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-1 truncate">
                    {art.title}
                  </h3>
                  <div className="flex flex-row gap-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {art.category.name}
                    </span>
                    <span className=" text-orange-600 italic px-2 py-1  text-xs">
                      {art.artist}
                    </span>
                  </div>
                  {isDisabled && (
                    <p className="mt-2 text-xs italic text-gray-500">
                      Currently not available!
                    </p>
                  )}
                </CardContent>
              </div>
            );
          })}
        </div>
      </form>
    </Form>
  );
};

export default CollectionForm;
