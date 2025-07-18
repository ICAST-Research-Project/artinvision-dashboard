"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { artworkSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import Dropdown from "./Dropdown";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { createArtwork } from "@/actions/artwork";
import { Uploader } from "./Uploader";
import { Loader2 } from "lucide-react";

const ArtworkForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof artworkSchema>>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      title: "",
      description: "",
      artist: "",
      categoryId: "",
      imageUrls: [],
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof artworkSchema>) => {
    const result = await createArtwork(values);

    if (result.success) {
      toast("Artwork created successfully");
      router.push(`/museum/artworks/${result.data.id}`);
    } else {
      toast("Something went wrong!");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Artwork Title</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Artwork title"
                  {...field}
                  className="min-h-12 border border-gray-200 bg-light-600 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  required
                  placeholder="description"
                  {...field}
                  className="min-h-12 border border-gray-100 bg-light-600 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Artist Name</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="artist name"
                  {...field}
                  className="min-h-12 border border-gray-100 bg-light-600 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Select Artwork Category</FormLabel>
              <FormControl>
                <Dropdown
                  onChangeHandler={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrls"
          render={({ field }) => (
            <FormControl>
              <Uploader onUploadComplete={field.onChange} value={field.value} />
            </FormControl>
          )}
        />
        <Button
          type="submit"
          className="min-h-12 w-full text-white bg-blue-500 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          {isSubmitting ? "Submitting..." : "Add Artwork"}
        </Button>
      </form>
    </Form>
  );
};

export default ArtworkForm;
