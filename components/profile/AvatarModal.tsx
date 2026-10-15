"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string;
  onSelectAvatar: (file: File) => Promise<void>;
}

export function AvatarModal({
  open,
  onOpenChange,
  currentAvatar,
  onSelectAvatar,
}: AvatarModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    if (!selectedFile || isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      await onSelectAvatar(selectedFile);
      setSelectedFile(null);
      setPreview("");
      onOpenChange(false);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this profile photo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader className="p-0 border-none pb-4 text-left">
          <DialogTitle className="text-lg font-heading font-semibold text-neutral-900 dark:text-neutral-100">
            Update profile photo
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Choose a photo to upload to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
            <img
              src={preview || currentAvatar || "/app.svg"}
              alt="Profile photo preview"
              className="h-full w-full object-cover"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-5 text-sm text-neutral-600 hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:text-neutral-300">
            <UploadCloud className="h-4 w-4" />
            <span>{selectedFile ? selectedFile.name : "Choose image"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-xs"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={() => void handleApply()}
              disabled={!selectedFile || isSaving}
              className="rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
              Save photo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}