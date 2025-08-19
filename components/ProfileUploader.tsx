/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const BUCKET_BASE = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3}/${process.env.NEXT_PUBLIC_S3_BUCKET_NAME_PROFILE}`;

interface ProfileUploaderProps {
  onUploadComplete: (url: string | null) => void;
}

export function ProfileUploader({ onUploadComplete }: ProfileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!fileKey) return;
    try {
      setUploading(true);
      const res = await fetch("/api/profiles3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileKey }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Image removed");
      setPreviewUrl(null);
      setFileKey(null);
      onUploadComplete(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(e.message || "Delete failed");
    } finally {
      setUploading(false);
    }
  }, [fileKey, onUploadComplete]);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      try {
        setUploading(true);
        setError(null);

        const presignRes = await fetch("/api/profiles3/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to retrieve presigned URL");
        const { presignedUrl, key } = await presignRes.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.onload = () =>
            xhr.status < 400
              ? resolve()
              : reject(new Error(`Upload failed: ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(file);
        });

        const url = `${BUCKET_BASE}/${key}`;
        setPreviewUrl(url);
        setFileKey(key);
        onUploadComplete(url);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error("Upload error:", e);
        setError(e.message || "Upload error");
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className="border border-dashed p-4 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading…</p>
        ) : isDragActive ? (
          <p>Drop an image here</p>
        ) : (
          <p>Click or drag to upload a profile image</p>
        )}
        {error && <p className="text-red-600 mt-2">Error: {error}</p>}
      </div>

      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-full object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0"
            onClick={handleDelete}
            disabled={uploading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
