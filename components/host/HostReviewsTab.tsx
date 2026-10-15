"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, MessageSquare, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { replyToReview } from "@/store/slices/reviewsSlice";
import { HostReviewGuestModal } from "@/components/host/HostReviewGuestModal";
import { Reservation } from "@/types";

export function HostReviewsTab() {
  const dispatch = useAppDispatch();
  const { t, isBengali } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const allReviews = useAppSelector((state) => state.reviews.items);
  const reservations = useAppSelector((state) => state.booking.reservations);

  const [activeTab, setActiveTab] = useState<"sanctuary_reviews" | "guest_reviews">(
    "sanctuary_reviews",
  );
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [selectedGuestReservation, setSelectedGuestReservation] =
    useState<Reservation | null>(null);
  const [isReviewGuestModalOpen, setIsReviewGuestModalOpen] = useState(false);

  // Reviews on host's listings written by guests
  const sanctuaryReviews = allReviews.filter(
    (r) =>
      r.type === "host_review" &&
      (r.targetUserId === currentUser.id ||
        r.targetUserName === currentUser.name),
  );

  // Reviews host wrote for guests
  const reviewsHostWrote = allReviews.filter(
    (r) =>
      r.type === "guest_review" &&
      (r.authorId === currentUser.id ||
        r.authorName === currentUser.name),
  );

  // Checked-out guests waiting for review
  const pendingGuestsToReview = reservations.filter(
    (res) =>
      res.status === "completed" &&
      (res.hostId === currentUser.id),
  );

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try { await dispatch(
      replyToReview({
        reviewId,
        comment: replyText.trim(),
      }),
    ).unwrap(); } catch { return; }

    setReplyingToReviewId(null);
    setReplyText("");
  };

  const handleOpenReviewGuest = (reservation: Reservation) => {
    setSelectedGuestReservation(reservation);
    setIsReviewGuestModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-8">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-sans text-neutral-400">
        <Link
          href="/host"
          className="hover:text-neutral-900 dark:hover:text-white transition"
        >
          {t("host.suiteTitle")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
        <span className="text-neutral-700 dark:text-neutral-300 font-medium">
          {isBengali ? "রিভিউ" : "Reviews"}
        </span>
      </nav>

      {/* 2. Main Title */}
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white">
        {activeTab === "sanctuary_reviews"
          ? isBengali
            ? "আপনার আবাসনের রিভিউসমূহ"
            : "Reviews for your listings"
          : isBengali
          ? "অতিথিদের জন্য আপনার দেওয়া রিভিউ"
          : "Reviews you wrote for guests"}
      </h1>

      {/* 3. Underline Tab Bar */}
      <div className="flex items-center gap-8 border-b border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("sanctuary_reviews")}
          className={`pb-3.5 text-sm font-sans transition-all relative cursor-pointer ${
            activeTab === "sanctuary_reviews"
              ? "text-neutral-900 dark:text-white font-semibold"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
          }`}
        >
          {isBengali ? "আবাসনের রিভিউ" : "Reviews for your listings"}
          {activeTab === "sanctuary_reviews" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("guest_reviews")}
          className={`pb-3.5 text-sm font-sans transition-all relative cursor-pointer ${
            activeTab === "guest_reviews"
              ? "text-neutral-900 dark:text-white font-semibold"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
          }`}
        >
          {isBengali ? "অতিথিদের রিভিউ" : "Reviews you wrote for guests"}
          {activeTab === "guest_reviews" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white" />
          )}
        </button>
      </div>

      {/* 4. Tab 1: Reviews for your listings */}
      {activeTab === "sanctuary_reviews" && (
        <div className="space-y-6 pt-1">
          <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">
            {isBengali ? "পূর্ববর্তী রিভিউসমূহ" : "Past reviews"}
          </h2>

          {sanctuaryReviews.length === 0 ? (
            <p className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
              {isBengali
                ? "এখনও কোনো গেস্ট রিভিউ নেই।"
                : "No reviews for your listings yet."}
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-6">
              {sanctuaryReviews.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative ring-1 ring-neutral-200 dark:ring-neutral-700">
                        <Image
                          src={rev.authorAvatar}
                          alt={rev.authorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
                          {rev.authorName}
                        </h4>
                        <p className="text-xs font-sans text-neutral-400">
                          {rev.createdAt} • {rev.listingTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-sans font-medium text-neutral-800 dark:text-neutral-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-sm font-sans text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Host Response */}
                  {rev.response ? (
                    <div className="pl-4 border-l-2 border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Your response
                      </p>
                      <p>{rev.response.comment}</p>
                    </div>
                  ) : (
                    <div>
                      {replyingToReviewId === rev.id ? (
                        <div className="pt-2 space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            placeholder="Write a response to this review..."
                            className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToReviewId(null);
                                setReplyText("");
                              }}
                              className="px-3 py-1.5 text-xs font-sans text-neutral-500 hover:text-neutral-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendReply(rev.id)}
                              disabled={!replyText.trim()}
                              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-sans font-semibold cursor-pointer disabled:opacity-50"
                            >
                              Post response
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToReviewId(rev.id);
                            setReplyText("");
                          }}
                          className="text-xs font-sans font-medium text-neutral-600 dark:text-neutral-400 hover:underline cursor-pointer"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Reviews you wrote for guests */}
      {activeTab === "guest_reviews" && (
        <div className="space-y-8 pt-1">
          {/* Pending guests to review */}
          {pendingGuestsToReview.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">
                Guests waiting for your review
              </h2>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pendingGuestsToReview.map((res) => (
                  <div
                    key={res.id}
                    className="py-4 first:pt-0 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-heading font-semibold text-neutral-900 dark:text-white">
                        {res.guestName}
                      </h4>
                      <p className="text-xs font-sans text-neutral-400">
                        {res.listingTitle} • Checked out {res.checkOut}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenReviewGuest(res)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-sans font-semibold cursor-pointer transition shrink-0"
                    >
                      Review guest
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past reviews */}
          <div className="space-y-6">
            <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">
              {isBengali ? "পূর্ববর্তী রিভিউসমূহ" : "Past reviews"}
            </h2>

            {reviewsHostWrote.length === 0 ? (
              <p className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
                You haven&apos;t reviewed any guests yet.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-6">
                {reviewsHostWrote.map((rev) => (
                  <div key={rev.id} className="pt-6 first:pt-0 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
                          {rev.targetUserName}
                        </h4>
                        <p className="text-xs font-sans text-neutral-400">
                          Reviewed on {rev.createdAt} • {rev.listingTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-sans font-medium text-neutral-800 dark:text-neutral-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-sm font-sans text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Host Review Guest Modal */}
      {selectedGuestReservation && (
        <HostReviewGuestModal
          open={isReviewGuestModalOpen}
          onOpenChange={setIsReviewGuestModalOpen}
          reservation={selectedGuestReservation}
          onSuccess={() => setIsReviewGuestModalOpen(false)}
        />
      )}
    </div>
  );
}
