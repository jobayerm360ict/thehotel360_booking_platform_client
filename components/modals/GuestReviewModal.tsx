"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store/hooks";
import { markReservationReviewed } from "@/store/slices/bookingSlice";
import type { Reservation } from "@/types";
import { toast } from "@/components/ui/sonner";

export interface GuestReviewModalProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  reservation: Reservation | null;
  listingTitle?: string;
  listingImage?: string;
  listingLocation?: string;
  onSuccess?: () => void;
}

const REVIEW_TAGS = [
  "Breathtaking Views",
  "Spotless & Clean",
  "Exceptional Host",
  "Comfortable Bed",
  "Fast Wi-Fi",
  "Peaceful & Quiet",
  "Great Design",
  "Delicious Breakfast",
  "Prime Location",
  "Eco-Friendly",
];

const RATING_ASPECTS = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "accuracy", label: "Accuracy" },
  { key: "communication", label: "Host communication" },
  { key: "location", label: "Location" },
  { key: "checkIn", label: "Check-in" },
  { key: "value", label: "Value" },
];

export function GuestReviewModal({
  open,
  isOpen: legacyIsOpen,
  onOpenChange,
  onClose: legacyOnClose,
  reservation,
  listingTitle,
  listingImage,
  listingLocation,
  onSuccess,
}: GuestReviewModalProps) {
  const dispatch = useAppDispatch();
  const modalOpen = open !== undefined ? open : Boolean(legacyIsOpen);
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [reviewComment, setReviewComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!reservation || reservation.status !== "completed" || reservation.isReviewed) return null;

  const resetForm = () => {
    setOverallRating(0);
    setSubRatings({});
    setReviewComment("");
    setSelectedTags([]);
    setIsSuccess(false);
  };

  const closeModal = () => {
    resetForm();
    onOpenChange?.(false);
    legacyOnClose?.();
  };

  const ratingLabel = overallRating === 0
    ? "Select a rating"
    : overallRating === 5
      ? "Exceptional"
      : overallRating === 4
        ? "Very good"
        : overallRating === 3
          ? "Average"
          : overallRating === 2
            ? "Below expectations"
            : "Poor";

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (overallRating < 1 || !reviewComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dispatch(markReservationReviewed({
        reservationId: reservation.id,
        rating: overallRating,
        comment: reviewComment.trim(),
        ...(Object.keys(subRatings).length ? { subRatings } : {}),
        ...(selectedTags.length ? { tags: selectedTags } : {}),
      })).unwrap();
      setIsSuccess(true);
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not submit your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = listingTitle || reservation.listingTitle || "Stay";
  const image = listingImage || reservation.listingImage || "/app.svg";
  const location = listingLocation || reservation.location || "Location unavailable";

  return (
    <Dialog open={modalOpen} onOpenChange={(nextOpen) => !nextOpen && closeModal()}>
      <DialogContent
        className="max-w-2xl w-full overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-0 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onClose={closeModal}
      >
        {isSuccess ? (
          <div className="space-y-4 p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="font-heading text-2xl font-bold text-neutral-900 dark:text-white">Thank you for your review.</h3>
            <p className="mx-auto max-w-md text-sm text-neutral-500">Your feedback has been saved.</p>
            <button type="button" onClick={closeModal} className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white">Close</button>
          </div>
        ) : (
          <div className="flex max-h-[85vh] flex-col">
            <div className="flex items-center gap-4 border-b border-neutral-200/80 bg-neutral-50/80 p-6 dark:border-neutral-800 dark:bg-neutral-800/50">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <Image src={image} alt={title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">{reservation.checkIn} – {reservation.checkOut}</p>
                <h3 className="truncate font-heading font-bold text-neutral-900 dark:text-white">{title}</h3>
                <p className="truncate text-xs text-neutral-500">{location}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-6">
              <section className="rounded-2xl border border-brand-primary/15 bg-brand-primary-light/40 p-5 text-center dark:bg-neutral-800/40">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-secondary">Overall rating</p>
                <div className="mb-2 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      aria-label={"Rate " + score + " out of 5"}
                      onClick={() => setOverallRating(score)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={"h-8 w-8 " + (overallRating >= score ? "fill-brand-primary text-brand-primary" : "text-neutral-300 dark:text-neutral-600")} />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">{ratingLabel}</p>
              </section>

              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Rate specific aspects (optional)</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {RATING_ASPECTS.map((aspect) => (
                    <div key={aspect.key} className="flex items-center justify-between rounded-xl border border-neutral-200/60 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/60">
                      <span className="text-xs text-neutral-700 dark:text-neutral-300">{aspect.label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            aria-label={aspect.label + ": " + score}
                            onClick={() => setSubRatings((current) => ({ ...current, [aspect.key]: score }))}
                          >
                            <Star className={"h-4 w-4 " + ((subRatings[aspect.key] || 0) >= score ? "fill-brand-primary text-brand-primary" : "text-neutral-300 dark:text-neutral-600")} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Stay highlights (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((tag) => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={"rounded-full border px-3 py-1.5 text-xs transition " + (selected ? "border-brand-primary bg-brand-primary text-white" : "border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300")}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </section>

              <label className="block space-y-1.5">
                <span className="flex justify-between text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  <span>Public review</span>
                  <span className="font-normal text-neutral-400">{reviewComment.length}/5000</span>
                </span>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value.slice(0, 5000))}
                  required
                  rows={4}
                  placeholder="Share your experience for future guests."
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </label>

              <div className="flex justify-end gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-neutral-200 px-5 py-3 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">Cancel</button>
                <button type="submit" disabled={overallRating < 1 || !reviewComment.trim() || isSubmitting} className="rounded-2xl bg-brand-primary px-7 py-3 text-xs font-semibold text-white disabled:opacity-50">
                  {isSubmitting ? "Submitting…" : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}