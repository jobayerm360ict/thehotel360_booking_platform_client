"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface GuestReviewItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorLocation?: string;
  rating: number;
  timeAgo: string;
  stayDuration: string;
  comment: string;
  tags: string[];
}

import { Review } from "@/types";

interface ListingReviewsSectionProps {
  rating: number;
  reviews?: Review[];
}

export function ListingReviewsSection({
  rating,
  reviews: propReviews,
}: ListingReviewsSectionProps) {
  const customReviewsList = propReviews || [];

  const convertedCustomReviews: GuestReviewItem[] = customReviewsList.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    authorAvatar: r.authorAvatar,
    authorLocation: "Verified Sanctuary Guest",
    rating: r.rating,
    timeAgo: r.date || "Just now",
    stayDuration: "Verified Stay",
    comment: r.comment,
    tags: [],
  }));

  const allMergedReviews: GuestReviewItem[] = convertedCustomReviews;

  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const [allReviewsModalOpen, setAllReviewsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const effectiveReviewCount = allMergedReviews.length;

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredReviews = allMergedReviews;

  const modalFilteredReviews = searchQuery
    ? allMergedReviews.filter(
        (r) =>
          r.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allMergedReviews;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);

  const scrollSlider = (direction: "prev" | "next") => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.clientWidth * 0.88;
    const scrollAmount = direction === "next" ? cardWidth : -cardWidth;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const cardWidth = sliderRef.current.clientWidth * 0.88;
    const newIdx = Math.round(scrollLeft / cardWidth);
    setMobileSlideIndex(Math.max(0, Math.min(newIdx, filteredReviews.length - 1)));
  };

  return (
    <div className="py-4 border-b border-neutral-200 dark:border-neutral-800 space-y-6">
      {/* Overall Score Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* <div className="flex items-center gap-2">
          <Star className="w-6 h-6 fill-brand-primary text-brand-primary" />
          <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
            {rating.toFixed(2)} · {effectiveReviewCount} verified reviews
          </h3>
        </div> */}

        {/* Mobile Swipe Notice & Navigation Controls */}
        <div className="flex md:hidden items-center justify-between sm:justify-end gap-3 pt-1">
          <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full">
            Swipe reviews ({filteredReviews.length ? mobileSlideIndex + 1 : 0}/{filteredReviews.length})
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollSlider("prev")}
              className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-brand-primary hover:text-white active:scale-90 transition cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("next")}
              className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-brand-primary hover:text-white active:scale-90 transition cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {effectiveReviewCount === 0 && <p className="text-sm text-neutral-500">No guest reviews yet.</p>}

      {/* Review Cards: Horizontal Slider on Mobile, 2-Column Grid on Tablet/Desktop */}
      <div
        ref={sliderRef}
        onScroll={handleSliderScroll}
        className="flex md:grid md:grid-cols-2 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none gap-4 md:gap-6 w-full pt-1"
      >
        {filteredReviews.map((rev) => {
          const isExpanded = expandedReviews[rev.id];
          const isLong = rev.comment.length > 120;
          const displayComment =
            isLong && !isExpanded
              ? rev.comment.slice(0, 115) + "..."
              : rev.comment;

          return (
            <div
              key={rev.id}
              className="w-[88%] sm:w-[75%] md:w-auto shrink-0 md:shrink snap-center p-5 sm:p-6 rounded-xl  border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              {/* Header: Author Avatar & Name */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-800 border-2 border-white dark:border-neutral-700 shadow-xs">
                  {rev.authorAvatar ? (
                    <Image
                      src={rev.authorAvatar}
                      alt={rev.authorName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                      {rev.authorName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {rev.authorName}
                  </h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {rev.authorLocation}
                  </p>
                </div>
              </div>

              {/* Rating Stars & Relative Date */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-brand-primary text-brand-primary"
                    />
                  ))}
                </div>
                <span>•</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {rev.timeAgo}
                </span>
                <span>•</span>
                <span className="truncate">{rev.stayDuration}</span>
              </div>

              {/* Comment Content */}
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans flex-1">
                {displayComment}
              </p>

              {/* Expand Toggle */}
              {isLong && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleExpand(rev.id)}
                    className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover underline transition cursor-pointer"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Pagination Dots */}
      <div className="flex md:hidden items-center justify-center gap-1.5 pt-2">
        {filteredReviews.map((_, idx) => (
          <span
            key={idx}
            className={`transition-all duration-300 rounded-full ${
              mobileSlideIndex === idx
                ? "w-5 h-1.5 bg-brand-primary"
                : "w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700"
            }`}
          />
        ))}
      </div>

      {/* Show All Reviews Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setAllReviewsModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 active:scale-95 font-heading font-semibold text-xs sm:text-sm cursor-pointer shadow-xs text-center"
        >
          Show all {effectiveReviewCount} reviews
        </button>
      </div>

      {/* All Reviews Modal */}
      <Dialog open={allReviewsModalOpen} onOpenChange={setAllReviewsModalOpen}>
        <DialogContent
          className="max-w-3xl p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-3xl"
          onClose={() => setAllReviewsModalOpen(false)}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-brand-primary text-brand-primary" />
              <h3 className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
                {rating.toFixed(2)} · {effectiveReviewCount} reviews
              </h3>
            </div>
          </div>

          {/* Search Reviews Input */}
          <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews by keyword or author..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {modalFilteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="pb-6 border-b border-neutral-100 dark:border-neutral-800 last:border-none space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-800">
                    {rev.authorAvatar ? (
                      <Image
                        src={rev.authorAvatar}
                        alt={rev.authorName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                        {rev.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {rev.authorName}
                    </h5>
                    <p className="text-xs text-neutral-500">
                      {rev.authorLocation} · {rev.timeAgo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-brand-primary text-brand-primary"
                      />
                    ))}
                  </div>
                  <span>•</span>
                  <span>{rev.stayDuration}</span>
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
