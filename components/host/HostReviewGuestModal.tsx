"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addReview } from "@/store/slices/reviewsSlice";
import { UserReview } from "@/types/review";
import { Reservation } from "@/types";
import { Star, CheckCircle2 } from "lucide-react";

interface HostReviewGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onSuccess?: () => void;
}

export function HostReviewGuestModal({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: HostReviewGuestModalProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [overallRating, setOverallRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!reservation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!comment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try { await dispatch(addReview({ reservationId: reservation.id, id: "", type: "guest_review", targetUserId: reservation.guestId,
      targetUserName: reservation.guestName, authorId: currentUser.id, authorName: currentUser.name, authorAvatar: currentUser.avatar,
      authorRole: "host", listingId: reservation.listingId, listingTitle: reservation.listingTitle, rating: overallRating,
      comment: comment.trim(), createdAt: "" })).unwrap(); setIsSuccess(true); onSuccess?.();
    } catch { setIsSuccess(false); } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6 sm:p-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-[99999]">
        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">
              Review Submitted
            </h3>
            <p className="text-xs font-sans text-neutral-500">
              Your review for {reservation.guestName} has been saved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Guest Summary */}
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200">
                <Image
                  src={reservation.guestAvatar}
                  alt={reservation.guestName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
                  Review {reservation.guestName}
                </h3>
                <p className="text-xs font-sans text-neutral-400">
                  {reservation.listingTitle}
                </p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="space-y-1.5 text-center">
              <p className="text-xs font-sans text-neutral-500">Rating</p>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="p-1 cursor-pointer transition hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        overallRating >= star
                          ? "fill-amber-400 text-amber-500"
                          : "text-neutral-300 dark:text-neutral-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Written Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-medium text-neutral-700 dark:text-neutral-300 block">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder={`Describe your experience hosting ${reservation.guestName}...`}
                className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-xl text-xs font-sans text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-sans font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
