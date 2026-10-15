"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploadItem {
  id: string;
  url: string;
  file?: File;
}

export interface ImageUploadFieldProps {
  label?: string;
  description?: string;
  images: ImageUploadItem[];
  onChange: (images: ImageUploadItem[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUploadField({
  label = "Room & Listing Photos",
  // description = "Upload high-resolution photos showcasing this room's interior, bed, and view (PNG, JPG, WEBP, up to 5MB each).",
  images,
  onChange,
  maxFiles = 10,
  className,
  disabled = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newItems: ImageUploadItem[] = filesToProcess.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: URL.createObjectURL(file),
      file,
    }));

    onChange([...images, ...newItems]);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(images.filter((img) => img.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div>
          {label && (
            <label className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 block">
              {label}
            </label>
          )}
          {/* {description && (
            <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 mt-0.5">
              {description}
            </p>
          )} */}
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-6 text-center transition cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10",
          disabled && "opacity-50 cursor-not-allowed",
          images.length >= maxFiles && "opacity-60 pointer-events-none",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || images.length >= maxFiles}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary-light/60 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center shadow-2xs">
            <Upload className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200">
              Click to upload or drag &amp; drop photos
            </p>
            <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400">
              {images.length} of {maxFiles} photos uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 group shadow-2xs"
            >
              <Image
                src={img.url}
                alt={`Room photo ${index + 1}`}
                fill
                unoptimized
                className="object-cover transition duration-300 group-hover:scale-105"
              />

              {/* Cover badge for first image */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-brand-primary text-white text-[9px] font-sans font-bold flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Cover</span>
                </div>
              )}

              {/* Delete Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(img.id, e)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-90"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
