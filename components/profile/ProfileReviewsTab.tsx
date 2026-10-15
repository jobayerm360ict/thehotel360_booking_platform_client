"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, PenTool } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { GuestReviewModal } from "@/components/modals/GuestReviewModal";
import { Reservation } from "@/types";

export function ProfileReviewsTab() {
  const { t, isBengali } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const allReviews = useAppSelector((state) => state.reviews.items);
  const loadGuestTrips = useCallback(() => platformService.trips(), []);
  const { data: reservationData, loading: tripsLoading, error: tripsError, reload: reloadTrips } = usePlatformData(loadGuestTrips);
  const reservations = reservationData || [];

  const [activeTab, setActiveTab] = useState<"about_you" | "by_you">(
    "about_you",
  );
  const [selectedReservationToReview, setSelectedReservationToReview] =
    useState<Reservation | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Reviews written about this user by hosts
  const reviewsAboutYou = allReviews.filter(
    (r) =>
      r.type === "guest_review" &&
      (r.targetUserId === currentUser.id ||
        r.targetUserName?.toLowerCase() === currentUser.name?.toLowerCase()),
  );

  // Reviews written by this user for sanctuaries
  const reviewsByYou = allReviews.filter(
    (r) =>
      r.type === "host_review" &&
      (r.authorId === currentUser.id ||
        r.authorName?.toLowerCase() === currentUser.name?.toLowerCase()),
  );

  // Completed reservations waiting for a review
  const reviewsToWrite = reservations.filter(
    (res) =>
      res.status === "completed" &&
      !res.isReviewed &&
      (res.guestId === currentUser.id || res.guestEmail === currentUser.email),
  );

  const handleOpenWriteReview = (reservation: Reservation) => {
    setSelectedReservationToReview(reservation);
    setIsReviewModalOpen(true);
  };

  if (tripsLoading && !reservationData) {
    return <div className="rounded-2xl border bg-white p-8 text-center text-neutral-500 dark:bg-neutral-900">Loading your reviews…</div>;
  }
  if (tripsError && !reservationData) {
    return <div role="alert" className="rounded-2xl border bg-white p-8 text-center dark:bg-neutral-900">{tripsError}<button className="ml-3 underline" onClick={reloadTrips}>Retry</button></div>;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-8">
      {/* 1. Breadcrumbs */}

      {/* 2. Main Title */}
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 dark:text-white">
        {activeTab === "about_you"
          ? isBengali
            ? "আপনার সম্পর্কে রিভিউ"
            : "Reviews about you"
          : isBengali
            ? "আপনার দেওয়া রিভিউ"
            : "Reviews by you"}
      </h1>

      {/* 3. Underline Tab Bar (Clean Minimalist Airbnb Style) */}
      <div className="flex items-center gap-8 border-b border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("about_you")}
          className={`pb-3.5 text-sm font-sans transition-all relative cursor-pointer ${
            activeTab === "about_you"
              ? "text-brand-primary dark:text-white font-semibold"
              : "text-neutral-500 hover:text-brand-primary dark:hover:text-brand-primary"
          }`}
        >
          {isBengali ? "আপনার সম্পর্কে রিভিউ" : "Reviews about you"}
          {activeTab === "about_you" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary dark:bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("by_you")}
          className={`pb-3.5 text-sm font-sans transition-all relative cursor-pointer ${
            activeTab === "by_you"
              ? "text-brand-primary dark:text-white font-semibold"
              : "text-neutral-500 hover:text-brand-primary dark:hover:text-brand-primary"
          }`}
        >
          {isBengali ? "আপনার দেওয়া রিভিউ" : "Reviews by you"}
          {activeTab === "by_you" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary dark:bg-white" />
          )}
        </button>
      </div>

      {/* 4. Tab 1 Content: Reviews about you */}
      {activeTab === "about_you" && (
        <div className="space-y-6 pt-1">
          <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">
            {isBengali ? "পূর্ববর্তী রিভিউসমূহ" : "Past reviews"}
          </h2>

          {reviewsAboutYou.length === 0 ? (
            /* Clean Empty State from Reference */
            <p className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
              {isBengali
                ? "এখনও কেউ আপনার সম্পর্কে রিভিউ দেয়নি।"
                : "No one has reviewed you yet."}
            </p>
          ) : (
            /* Clean Reviews List */
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-6">
              {reviewsAboutYou.map((rev) => (
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
                          {rev.createdAt}
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

                  {rev.response && (
                    <div className="pl-4 border-l-2 border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Response from {rev.response.authorName}
                      </p>
                      <p>{rev.response.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2 Content: Reviews by you */}
      {activeTab === "by_you" && (
        <div className="space-y-8 pt-1">
          {/* Reviews to write (if any) */}
          {reviewsToWrite.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white">
                {isBengali ? "রিভিউ দেওয়ার বাকি আছে" : "Reviews to write"}
              </h2>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {reviewsToWrite.map((res) => (
                  <div
                    key={res.id}
                    className="py-4 first:pt-0 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-heading font-semibold text-neutral-900 dark:text-white">
                        {res.listingTitle}
                      </h4>
                      <p className="text-xs font-sans text-neutral-400">
                        Stayed {res.checkIn} to {res.checkOut}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenWriteReview(res)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-sans font-semibold cursor-pointer transition shrink-0"
                    >
                      Write review
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

            {reviewsByYou.length === 0 ? (
              <p className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
                {isBengali
                  ? "আপনি এখনও কোনো রিভিউ দেননি।"
                  : "You haven't written any reviews yet."}
              </p>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-6">
                {reviewsByYou.map((rev) => (
                  <div key={rev.id} className="pt-6 first:pt-0 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
                          {rev.listingTitle || "Listing"}
                        </h4>
                        <p className="text-xs font-sans text-neutral-400">
                          Reviewed on {rev.createdAt}
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

      {/* Guest Review Modal */}
      {selectedReservationToReview && (
        <GuestReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          reservation={selectedReservationToReview}
          onSuccess={reloadTrips}
        />
      )}
    </div>
  );
}
