"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, UploadCloud, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageUrlSchema } from "@/lib/validations/image";
import { convertFileToBase64, validateImageFile } from "@/utils/image";

interface ImageUploaderProps {
  image?: string;
  imageSource?: "upload" | "url";
  onChange: (image: string | undefined, source: "upload" | "url" | undefined) => void;
}

export function ImageUploader({ image, imageSource, onChange }: ImageUploaderProps) {
  const [tab, setTab] = useState<"upload" | "url">(imageSource ?? "upload");
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(imageSource === "url" ? image ?? "" : "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hasImage = useMemo(() => Boolean(image && image.trim().length > 0), [image]);

  const handleFile = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      onChange(base64, "upload");
      setPreviewError(null);
      setUrlError(null);
      setTab("upload");
    } catch {
      toast.error("Unable to process image");
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await handleFile(file);
    event.target.value = "";
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    await handleFile(file);
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);

    if (value.trim().length === 0) {
      setUrlError(null);
      if (imageSource === "url") {
        onChange(undefined, undefined);
      }
      return;
    }

    const parsed = imageUrlSchema.safeParse(value.trim());
    if (!parsed.success) {
      setUrlError(parsed.error.issues[0]?.message ?? "Invalid image URL");
      return;
    }

    setUrlError(null);
    setPreviewError(null);
    onChange(value.trim(), "url");
    setTab("url");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Product Image</p>

      <Tabs value={tab} onValueChange={(value) => setTab(value as "upload" | "url")} className="mt-4">
        <TabsList className="grid w-full grid-cols-2 rounded-xl border border-white/10 bg-white/5">
          <TabsTrigger
            value="upload"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"
          >
            Upload from Device
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"
          >
            Paste Image URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInput}
          />
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-primary/55 bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.12),rgba(255,255,255,0.04))]"
            }`}
          >
            <UploadCloud className="mx-auto h-9 w-9 text-primary" />
            <p className="mt-3 text-sm font-semibold text-white">Drag & drop your image here</p>
            <p className="mt-1 text-xs text-white/60">or click to browse from your device</p>
            <p className="mt-2 text-[11px] text-white/45">JPG, JPEG, PNG, WEBP • Max 2MB</p>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">
              Image URL
            </label>
            <div className="relative">
              <LinkIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/45" />
              <input
                value={urlInput}
                onChange={(event) => handleUrlChange(event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {urlError && <p className="mt-2 text-xs text-red-300">{urlError}</p>}
          </div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {hasImage && image && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">Image Preview</p>
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30">
              <Image
                src={image}
                alt="Menu item preview"
                width={800}
                height={450}
                className="max-h-[200px] w-full object-cover"
                unoptimized
                onError={() => setPreviewError("Unable to load preview image")}
              />
            </div>
            {previewError && <p className="mt-2 text-xs text-red-300">{previewError}</p>}
            <button
              type="button"
              onClick={() => {
                onChange(undefined, undefined);
                setUrlInput("");
                setUrlError(null);
                setPreviewError(null);
              }}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-300 transition-colors hover:text-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Remove Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
