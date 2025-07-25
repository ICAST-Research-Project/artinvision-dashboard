"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  createArtworkByArtist,
  updateArtworkByArtist,
} from "@/actions/artwork";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Dropdown from "./Dropdown";
import { Uploader } from "./Uploader";
import { artistArtworkSchema } from "@/schemas";

type FormValues = z.infer<typeof artistArtworkSchema>;

interface ArtworkFormProps {
  id?: string;

  initialValues?: Omit<FormValues, "artist">;
}

export default function ArtworkForm({ id, initialValues }: ArtworkFormProps) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const form = useForm<FormValues>({
    resolver: zodResolver(artistArtworkSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      categoryId: "",
      imageUrls: [],
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        const result = await updateArtworkByArtist({ id: id!, ...values });
        if (result.success) {
          toast.success("Artwork updated successfully");
          router.push(`/artist/artworks/${id}`);
          return;
        }
        toast.error("Failed to update artwork");
      } else {
        const result = await createArtworkByArtist(values);
        if (result.success) {
          toast.success("Artwork created successfully");
          router.push(`/artist/artworks/${result.data.id}`);
          return;
        }
        toast.error("Failed to create artwork");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Unexpected error");
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
                <Input {...field} placeholder="Artwork title" required />
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
                <Textarea {...field} placeholder="Description" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Select Artwork Category</FormLabel>
              <FormControl>
                <Dropdown
                  value={field.value}
                  onChangeHandler={field.onChange}
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
            <FormItem>
              <FormControl>
                <Uploader
                  onUploadComplete={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          {isEdit ? "Update Changes" : "Add Artwork"}
        </Button>
      </form>
    </Form>
  );
}
  