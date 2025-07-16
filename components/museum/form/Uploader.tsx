/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export function Uploader() {
  const [files, setFiles] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);

  async function removeFile(fileId: string) {
    try {
      const fileToRemove = files.find((f) => f.id === fileId);
      if (fileToRemove) {
        if (fileToRemove.objectUrl) {
          URL.revokeObjectURL(fileToRemove.objectUrl);
        }
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
      );

      const deletefileResponse = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileToRemove?.key }),
      });

      if (!deletefileResponse.ok) {
        toast.error("Failed to remove file from storage.");
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, isDeleting: false, error: true } : f
          )
        );
        return;
      }

      toast.success("File removed successfully");
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    } catch {
      toast.error("Failed to remove file from storage.");
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
    }
  }

  async function uploadFile(file: File) {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );
    try {
      const presignedUrlResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      if (!presignedUrlResponse.ok) {
        toast.error("Failed to get presigned URL");

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file
              ? { ...f, uploading: false, progress: 0, error: true }
              : f
          )
        );
        return;
      }

      const { presignedUrl, key } = await presignedUrlResponse.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      progress: Math.round(percentageCompleted),
                      key: key,
                    }
                  : f
              )
            );
          }
        };
        xhr.onload = () => {
          if (xhr.status == 200 || xhr.status == 204) {
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      uploading: false,
                      progress: 100,

                      error: false,
                    }
                  : f
              )
            );
            toast.success("File uplaoded successfully");
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch {
      toast.error("uplaod failed");
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file
            ? {
                ...f,
                uploading: false,
                progress: 0,
                error: true,
              }
            : f
        )
      );
    }
  }
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          id: uuidv4(),
          file: file,
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
          objectUrl: URL.createObjectURL(file),
        })),
      ]);
    }
    acceptedFiles.forEach(uploadFile);
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tooManyFiles = fileRejections.find(
        (fileRejections) => fileRejections.errors[0].code === "too-many-files"
      );

      const fileTooLarge = fileRejections.find(
        (fileRejections) => fileRejections.errors[0].code === "file-too-large"
      );

      if (tooManyFiles) {
        toast.error("You can only upload 5 files.");
      }
      if (fileTooLarge) {
        toast.error("The file size is too large");
      }
    }
    console.log(fileRejections);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 1024 * 1024 * 5,
    accept: {
      "image/*": [],
    },
  });

  return (
    <>
      <Card
        className={cn(
          "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
          isDragActive
            ? "border-primary bg-primary/10 border-solid"
            : "border-border hover:border-primary"
        )}
        {...getRootProps()}
      >
        <CardContent className="flex flex-col items-center justify-center h-full w-full">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full gap-y-3">
              <p>
                Drag &apos;n&apos; drop some files here, or click to select
                files
              </p>
              <Button>Select files</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-6 mb-24">
        {files.map((file) => (
          <div key={file.id} className="flex flex-col gap-1">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={file.objectUrl}
                alt={file.file.name}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeFile(file.id)}
                disabled={file.uploading || file.isDeleting}
              >
                {file.isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
              {file.uploading && !file.isDeleting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-white font-medium text-lg">
                    {file.progress}
                  </p>
                </div>
              )}
              {file.error && (
                <div className="absolute inset-0 bg-red-500/50 flex items-center judtify-center">
                  <p className="text-white font-medium text-lg">Error</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {file.file.name}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
