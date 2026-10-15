"use client";

import React, { useEffect, useState } from "react";
import { Listing } from "@/types";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { formatPrice, calculateNights } from "@/lib/utils";
import { Calendar, ArrowRight, Star } from "lucide-react";

interface MobileStickyBookingBarProps {
  listing: Listing;
  startDate: string | null;
  endDate: string | null;
  selectedRoomId?: string | null;
  onScrollToDatePicker?: () => void;
}

export function MobileStickyBookingBar({
  listing,
  startDate,
  endDate,
  selectedRoomId,
  onScrollToDatePicker,
}: MobileStickyBookingBarProps) {
  const router = useRouter();
  const guests = useAppSelector((state) => state.filter.guests);
  const [showOnDesktop, setShowOnDesktop] = useState(false);

  const nights = calculateNights(startDate, endDate);

  // On desktop (lg+), show the sticky bottom bar once the user scrolls down
  // past the main booking widget area so they always have easy access to reserve
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const widgetEl = document.getElementById("booking-widget-section");
      if (widgetEl) {
        const widgetBottom = widgetEl.offsetTop + widgetEl.offsetHeight - 200;
        setShowOnDesktop(scrollY > widgetBottom);
      } else {
        setShowOnDesktop(scrollY > 600);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleConfirmAndReserve = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("checkIn", startDate);
    if (endDate) params.set("checkOut", endDate);
    params.set("adults", String(guests.adults || 1));
    params.set("children", String(guests.children || 0));
    params.set("infants", String(guests.infants || 0));
    params.set("pets", String(guests.pets || 0));
    if (selectedRoomId) params.set("roomId", selectedRoomId);

    router.push(`/book/${listing.id}?${params.toString()}`);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-md border-t border-neutral-200/90 dark:border-neutral-800 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.14)] transition-all duration-300 ${
        showOnDesktop ? "block" : "block lg:hidden"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Pricing, Rating & Selected Dates */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {formatPrice(listing.pricePerNight)}
              </span>
              <span className="text-xs text-neutral-500 font-sans">
                / night
              </span>
              {listing.originalPrice && (
                <span className="text-xs text-neutral-400 line-through hidden sm:inline">
                  {formatPrice(listing.originalPrice)}
                </span>
              )}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500 ml-2">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {listing.rating.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dates button to jump to calendar */}
            <button
              type="button"
              onClick={onScrollToDatePicker}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-brand-primary font-semibold underline underline-offset-2 hover:text-brand-primary-hover transition text-left cursor-pointer mt-0.5 truncate"
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {startDate && endDate
                  ? `${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)} (${nights} nights)`
                  : "Select dates"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Side: Request to Book / Confirm Booking Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleConfirmAndReserve}
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-brand-primary/25 hover:shadow-lg hover:shadow-brand-primary/35 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <>
              {startDate && endDate ? "Confirm & Reserve" : "Request to Book"}
            </>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
