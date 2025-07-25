"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";

interface UploaderProps {
  value: string[];
  onUploadComplete: (urls: string[]) => void;
}

const BUCKET_BASE =
  `${process.env.NEXT_PUBLIC_AWS_ENDPOINT_URL_S3}` +
  `/${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}`;

type FileEntry = {
  id: string;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
};

export function Uploader({ value, onUploadComplete }: UploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current && value.length > 0) {
      const seeded = value.map((url) => {
        // extract the S3 key from the URL
        const prefix = BUCKET_BASE + "/";
        const key = url.startsWith(prefix)
          ? url.slice(prefix.length)
          : undefined;
        return {
          id: uuidv4(),
          file: null,
          uploading: false,
          progress: 100,
          key,
          isDeleting: false,
          error: false,
          objectUrl: url,
        } as FileEntry;
      });
      setFiles(seeded);
    }
  }, [value]);

  useEffect(() => {
    didInit.current = true;
  }, []);

  useEffect(() => {
    if (!didInit.current) return;
    const urls = files
      .map((f) => (f.key ? `${BUCKET_BASE}/${f.key}` : null))
      .filter((u): u is string => !!u);
    onUploadComplete(urls);
  }, [files, onUploadComplete]);

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId);
    if (!fileToRemove) return;

    if (fileToRemove.objectUrl && fileToRemove.file) {
      URL.revokeObjectURL(fileToRemove.objectUrl);
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
    );

    try {
      const res = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileToRemove.key }),
      });
      if (!res.ok) throw new Error("Delete failed");

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("Removed image");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
    }
  };

  const uploadFile = async (file: File) => {
    setFiles((prev) =>
      prev.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );

    try {
      const presigned = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      if (!presigned.ok) throw new Error("Presign failed");
      const { presignedUrl, key } = await presigned.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.file === file ? { ...f, progress: pct, key } : f
              )
            );
          }
        };
        xhr.onload = () =>
          xhr.status < 400
            ? resolve()
            : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, uploading: false, progress: 100, key, error: false }
            : f
        )
      );
      toast.success("Uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, uploading: false, progress: 0, error: true }
            : f
        )
      );
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    const newEntries: FileEntry[] = accepted.map((file) => ({
      id: uuidv4(),
      file,
      uploading: false,
      progress: 0,
      key: undefined,
      isDeleting: false,
      error: false,
      objectUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newEntries]);
    accepted.forEach(uploadFile);
  }, []);

  const onReject = useCallback((rejs: FileRejection[]) => {
    if (rejs.some((r) => r.errors[0].code === "file-too-large")) {
      toast.error("File too large");
    }
    if (rejs.some((r) => r.errors[0].code === "too-many-files")) {
      toast.error("Max 5 files");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: onReject,
    maxFiles: 5,
    maxSize: 1024 * 1024 * 5,
    accept: { "image/*": [] },
  });

  return (
    <>
      <Card
        className={cn(
          "w-full h-64 border-2 border-dashed transition-colors",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary"
        )}
        {...getRootProps()}
      >
        <CardContent className="flex flex-col items-center justify-center h-full">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop here…</p>
          ) : (
            <div className="text-center">
              <p>Drag & drop or click to select images</p>
              <Button>Select files</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-6">
        {files.map((f) => (
          <div key={f.id} className="relative">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={f.objectUrl!}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removeFile(f.id)}
              disabled={f.uploading || f.isDeleting}
            >
              {f.isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
            {f.uploading && !f.isDeleting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white font-medium">{f.progress}%</p>
              </div>
            )}
            {f.error && (
              <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                <p className="text-white font-medium">Error</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
