"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, UploadCloud, Info } from "lucide-react";
import { toast } from "sonner";
import { convertFileToBase64, validateImageFile } from "@/utils/image";

interface ImageUploaderProps {
  image?: string;
  imageSource?: "upload" | "url";
  onChange: (image: string | undefined, source: "upload" | "url" | undefined) => void;
}

export function ImageUploader({ image, imageSource, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
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
    } catch {
      toast.error("Unable to process image");
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFile(file);
    event.target.value = "";
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Product Image</p>

      {/* Upload area */}
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
        <p className="mt-2 text-[11px] text-white/45">JPG, PNG, WEBP · Max 500KB</p>
      </div>

      {/* WebP tip */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/6 px-3 py-2.5">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300/80 leading-relaxed">
          <strong className="text-amber-300">Use WebP for best performance.</strong>{" "}
          WebP images load faster and use less storage. Convert your images at{" "}
          <span className="text-amber-400 font-mono">squoosh.app</span> before uploading.
          Recommended size: 200×200px for menu items.
        </p>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {hasImage && image && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">Image Preview</p>
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30">
              <Image
                src={image}
                alt="Menu item preview"
                width={800}
                height={450}
                className="max-h-[200px] w-full object-contain"
                unoptimized
                onError={() => setPreviewError("Unable to load preview image")}
              />
            </div>
            {previewError && <p className="mt-2 text-xs text-red-300">{previewError}</p>}
            <button
              type="button"
              onClick={() => {
                onChange(undefined, undefined);
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
