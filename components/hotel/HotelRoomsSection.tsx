"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { HotelRoom, Listing } from "@/types";
import { formatPrice, calculateNights } from "@/lib/utils";
import { platformService, type RoomCalendar } from "@/services/platformService";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  Bed,
  Users,
  Maximize2,
  Check,
  Sparkles,
  Coffee,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building,
  ChevronRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HotelRoomsSectionProps {
  listing: Listing;
  startDate: string | null;
  endDate: string | null;
  selectedRoomId: string | null;
  onSelectRoom: (room: HotelRoom) => void;
  onOpenDatePicker?: () => void;
}

export function HotelRoomsSection({
  listing,
  startDate,
  endDate,
  selectedRoomId,
  onSelectRoom,
  onOpenDatePicker,
}: HotelRoomsSectionProps) {
  const { t, isBengali } = useTranslation();
  const rooms = listing.hotelRooms || [];
  const nights = calculateNights(startDate, endDate);
  const hasDates = Boolean(startDate && endDate && endDate > startDate && nights > 0);
  const [retryCount, setRetryCount] = useState(0);
  const queryKey = listing.id + ":" + startDate + ":" + endDate + ":" + retryCount;
  const [availability, setAvailability] = useState<{ key: string; rows: RoomCalendar[]; error: string } | null>(null);
  useEffect(() => {
    if (!hasDates || !startDate || !endDate) return;
    let cancelled = false;
    platformService.availability(listing.id, startDate, endDate)
      .then((rows) => { if (!cancelled) setAvailability({ key: queryKey, rows, error: "" }); })
      .catch((error: unknown) => {
        if (!cancelled) setAvailability({
          key: queryKey, rows: [],
          error: error instanceof Error ? error.message : "Could not check room availability.",
        });
      });
    return () => { cancelled = true; };
  }, [listing.id, startDate, endDate, hasDates, queryKey]);
  const availabilityReady = availability?.key === queryKey;
  const availabilityLoading = hasDates && !availabilityReady;
  const availabilityError = availabilityReady ? availability.error : "";
  const roomCalendars = availabilityReady ? availability.rows : [];

  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(
    null,
  );

  if (!rooms || rooms.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-3xl  dark:border-neutral-800  space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans font-semibold text-brand-primary uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>
              {isBengali ? "হোটেল রুম ও স্যুটসমূহ" : "Hotel Rooms & Suites"}
            </span>
          </div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-neutral-900 dark:text-white">
            {isBengali
              ? "উপলব্ধ রুম নির্বাচন করুন"
              : "Available Rooms for Your Stay"}
          </h2>
          <p className="text-xs sm:text-sm font-serif text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isBengali
              ? "নির্বাচিত তারিখ ও অতিথিদের সংখ্যার ওপর ভিত্তি করে রিয়েল-টাইম রুমের প্রাপ্যতা ও মোট ভাড়া"
              : "Real-time room availability and rates computed for your selected dates"}
          </p>
        </div>

        {/* Selected Dates Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#fcfbf9] dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700 text-xs font-sans shrink-0">
          <Calendar className="w-4 h-4 text-brand-primary" />
          <div>
            <div className="font-semibold text-neutral-900 dark:text-white">
              {startDate && endDate
                ? `${startDate} → ${endDate} (${nights} ${nights === 1 ? (isBengali ? "রাত" : "night") : isBengali ? "রাত" : "nights"})`
                : isBengali
                  ? "তারিখ নির্বাচন করুন"
                  : "Select dates"}
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">
              {startDate && endDate
                ? isBengali
                  ? "লাইভ এভেইলেবিলিটি সক্রিয়"
                  : availabilityReady && !availabilityError ? "Live availability checked" : "Checking availability"
                : isBengali
                  ? "প্রাপ্যতা দেখতে তারিখ বেছে নিন"
                  : "Pick dates to view exact availability"}
            </div>
          </div>
          {onOpenDatePicker && (
            <button
              type="button"
              onClick={onOpenDatePicker}
              className="ml-1 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              {isBengali ? "বদলান" : "Change"}
            </button>
          )}
        </div>
      </div>

      {availabilityLoading && <p role="status" className="text-sm text-neutral-500">Checking live room inventory…</p>}
      {availabilityError && <p role="alert" className="text-sm text-rose-700">{availabilityError}<button type="button" className="ml-3 underline" onClick={() => setRetryCount((value) => value + 1)}>Retry</button></p>}

      {/* Rooms List */}
      <div className="space-y-4">
        {rooms.map((room) => {
          const dates = roomCalendars.find((item) => item.roomId === room.id)?.dates || [];
          const availableCount = hasDates && availabilityReady && dates.length === nights
            ? Math.min(...dates.map((day) => day.available_quantity))
            : 0;
          const isAvailable = !hasDates || (availabilityReady && !availabilityError && availableCount > 0);
          const avail = {
            isAvailable,
            availableCount,
            statusBadge: !hasDates ? "select_dates" : availabilityLoading || availabilityError ? "checking" : !isAvailable ? "sold_out" : availableCount <= 2 ? "limited" : "available",
          };
          const isSelected = selectedRoomId === room.id && isAvailable;
          const totalForStay = hasDates && availabilityReady && !availabilityError && dates.length === nights
            ? dates.reduce((sum, day) => sum + day.price, 0)
            : null;

          return (
            <div
              key={room.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? "border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] shadow-md"
                  : !avail.isAvailable
                    ? "border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 opacity-75"
                    : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 p-4 sm:p-5">
                {/* 1. Room Image & Badges (Col 1-4) */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 group">
                    <Image
                      src={room.images[0] || listing.images[0] || "/app.svg"}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Room Type Pill */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-sans font-semibold uppercase tracking-wider">
                      {room.type}
                    </span>

                    {/* Quantity Badge */}
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 text-[10px] font-sans font-bold shadow-xs">
                      {isBengali
                        ? `মোট ${room.totalQuantity}টি রুম`
                        : `${room.totalQuantity} total rooms`}
                    </span>
                  </div>

                  {/* Thumbnail Row */}
                  {room.images.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      {room.images.slice(0, 3).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-9 rounded-md overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 dark:border-neutral-700"
                        >
                          <Image
                            src={img}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Room Specs & Amenities (Col 5-8) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-bold text-base sm:text-lg text-neutral-900 dark:text-white leading-tight">
                        {room.name}
                      </h3>
                    </div>

                    {/* Capacity & Specs Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-neutral-600 dark:text-neutral-300">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {room.capacity.adults}{" "}
                          {isBengali ? "প্রাপ্তবয়স্ক" : "Adults"}
                          {room.capacity.children > 0 &&
                            `, ${room.capacity.children} ${isBengali ? "শিশু" : "Child"}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{room.bedType}</span>
                      </div>

                      {room.roomSize && (
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{room.roomSize}</span>
                        </div>
                      )}
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-1.5 pt-1">
                      {room.breakfastIncluded && (
                        <div className="flex items-center gap-1.5 text-xs font-sans text-emerald-700 dark:text-emerald-400 font-medium">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>
                            {isBengali
                              ? "ফ্রি সকালের নাস্তা অন্তর্ভুক্ত"
                              : "Free Gourmet Breakfast Included"}
                          </span>
                        </div>
                      )}

                      {room.freeCancellation && (
                        <div className="flex items-center gap-1.5 text-xs font-sans text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {isBengali
                              ? "ফ্রি ক্যান্সেলেশন সুবিধা"
                              : "Free Cancellation Available"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-sans text-neutral-600 dark:text-neutral-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Availability status badge */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                    {avail.statusBadge === "select_dates" || avail.statusBadge === "checking" ? (
                      <Badge className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 font-sans text-xs">
                        {avail.statusBadge === "checking" ? "Checking availability" : "Select dates for availability"}
                      </Badge>
                    ) : avail.statusBadge === "sold_out" ? (
                      <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-sans text-xs border-rose-200">
                        <AlertTriangle className="w-3 h-3 mr-1 text-rose-600 inline" />
                        {isBengali
                          ? "নির্বাচিত তারিখে কোনো রুম খালি নেই (Sold Out)"
                          : "Sold Out on Selected Dates"}
                      </Badge>
                    ) : avail.statusBadge === "limited" ? (
                      <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-sans text-xs border-amber-200 animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-600 inline" />
                        {isBengali
                          ? `তাড়াতাড়ি করুন! মাত্র ${avail.availableCount}টি রুম খালি আছে`
                          : `Hurry! Only ${avail.availableCount} rooms left on your dates`}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-sans text-xs border-emerald-200">
                        <Check className="w-3 h-3 mr-1 text-emerald-600 inline" />
                        {isBengali
                          ? `${avail.availableCount}টি রুম খালি আছে`
                          : `${avail.availableCount} rooms available`}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 3. Pricing & Booking Action (Col 9-12) */}
                <div className="lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 pt-3 lg:pt-0 lg:pl-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-sans text-neutral-400 block">
                      {isBengali ? "প্রতি রাতের ভাড়া" : "Price per night"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading font-bold text-2xl text-neutral-900 dark:text-white">
                        {formatPrice(totalForStay !== null && nights > 0 ? totalForStay / nights : room.pricePerNight)}
                      </span>
                      {room.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(room.originalPrice)}
                        </span>
                      )}
                      <span className="text-xs font-sans text-neutral-500">
                        /{isBengali ? "রাত" : "night"}
                      </span>
                    </div>

                    {hasDates && totalForStay !== null && (
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 mt-2 space-y-0.5">
                        <div className="text-[11px] font-sans text-neutral-500 flex justify-between">
                          <span>
                            {nights} {isBengali ? "রাতের মোট" : "nights total"}:
                          </span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {formatPrice(totalForStay)}
                          </span>
                        </div>
                        <span className="text-[9px] font-sans text-neutral-400 block">
                          {isBengali
                            ? "ভ্যাট ও সার্ভিস ফি ছাড়া"
                            : "+ estimated taxes & fees"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Room Selection Action */}
                  <div className="pt-4">
                    {isSelected ? (
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-primary text-white font-sans font-semibold text-xs shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {isBengali ? "সিলেক্ট করা হয়েছে" : "Selected Room"}
                        </span>
                      </button>
                    ) : avail.isAvailable ? (
                      <button
                        type="button"
                        onClick={() => onSelectRoom(room)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-sans font-semibold text-xs shadow-2xs transition-all cursor-pointer active:scale-98"
                      >
                        <span>
                          {isBengali ? "এই রুমটি বেছে নিন" : "Select Room"}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-sans font-semibold text-xs cursor-not-allowed"
                      >
                        {isBengali ? "রুম খালি নেই" : "Sold Out"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
