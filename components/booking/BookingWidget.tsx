"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Listing, HotelRoom } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createReservation } from "@/store/slices/bookingSlice";
import { setGuests } from "@/store/slices/filterSlice";
import { formatPrice, calculateNights } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Star,
  ShieldCheck,
  ChevronDown,
  Plus,
  Minus,
  Calendar as CalendarIcon,
  Building,
  Bed,
} from "lucide-react";

interface BookingWidgetProps {
  listing: Listing;
  startDate?: string | null;
  endDate?: string | null;
  onDatesChange?: (start: string | null, end: string | null) => void;
  selectedRoom?: HotelRoom | null;
  onSelectRoom?: (room: HotelRoom) => void;
}

export function BookingWidget({
  listing,
  startDate: propStartDate,
  endDate: propEndDate,
  onDatesChange,
  selectedRoom,
}: BookingWidgetProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);
  const currentUser = useAppSelector((state) => state.auth.user);

  const isHotel =
    listing.mainCategory === "hotels" ||
    Boolean(listing.hotelRooms && listing.hotelRooms.length > 0);
  const activePricePerNight =
    isHotel && selectedRoom
      ? selectedRoom.pricePerNight
      : listing.pricePerNight;

  // Dates state
  const [internalStartDate, setInternalStartDate] = useState<string | null>(
    filter.checkIn || null,
  );
  const [internalEndDate, setInternalEndDate] = useState<string | null>(
    filter.checkOut || null,
  );

  const startDate =
    propStartDate !== undefined ? propStartDate : internalStartDate;
  const endDate = propEndDate !== undefined ? propEndDate : internalEndDate;

  const handleDatesUpdate = (s: string | null, e: string | null) => {
    setInternalStartDate(s);
    setInternalEndDate(e);
    if (onDatesChange) {
      onDatesChange(s, e);
    }
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Guests state
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [adults, setAdults] = useState(filter.guests.adults || 2);
  const [children, setChildren] = useState(filter.guests.children || 0);

  useEffect(() => {
    dispatch(setGuests({ adults, children }));
  }, [adults, children, dispatch]);
  const [specialNote, setSpecialNote] = useState("");

  const nights = calculateNights(startDate, endDate);
  const basePrice = activePricePerNight * nights;
  const cleaningFee = Number((listing as Listing & { cleaningFee?: number }).cleaningFee || 0);
  const serviceFee = Number((listing as Listing & { serviceFee?: number }).serviceFee || 0);
  const totalPrice = basePrice + cleaningFee + serviceFee;

  const totalGuests = adults + children;

  const handleReserve = () => {
    if (!startDate || !endDate) { setIsCalendarOpen(true); return; }
    const query = new URLSearchParams({
      checkIn: startDate,
      checkOut: endDate,
      adults: adults.toString(),
      children: children.toString(),
      ...(selectedRoom ? { roomId: selectedRoom.id } : {}),
    });

    router.push(`/book/${listing.id}?${query.toString()}`);
  };

  return (
    <div className="sticky top-24 lg:top-35 max-h-[calc(100vh-7.5rem)] overflow-y-auto scrollbar-thin bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xl space-y-2.5">
      {/* Header Price & Rating */}
      <div className="flex flex-col gap-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-semibold text-neutral-900 dark:text-white">
              {formatPrice(activePricePerNight)}
            </span>
            <span className="text-xs font-sans text-neutral-500 font-medium">
              / night
            </span>
            {selectedRoom?.originalPrice ? (
              <span className="text-xs font-sans text-neutral-400 line-through">
                {formatPrice(selectedRoom.originalPrice)}
              </span>
            ) : listing.originalPrice ? (
              <span className="text-xs font-sans text-neutral-400 line-through">
                {formatPrice(listing.originalPrice)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 font-sans text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <Star className="w-4 h-4 fill-brand-primary text-brand-primary" />
            <span>{listing.rating.toFixed(2)}</span>
            <span className="text-neutral-400 font-normal">
              ({listing.reviewCount})
            </span>
          </div>
        </div>

        {/* Selected Hotel Room Pill if Applicable */}
        {isHotel && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Bed className="w-4 h-4 text-brand-primary shrink-0" />
              <div className="min-w-0">
                <span className="block font-bold text-neutral-900 dark:text-white truncate">
                  {selectedRoom ? selectedRoom.name : "Choose room below"}
                </span>
                <span className="text-[10px] text-neutral-500 block truncate">
                  {selectedRoom
                    ? `${selectedRoom.bedType} • ${selectedRoom.roomSize || "Ensuite"}`
                    : "Multiple room options available"}
                </span>
              </div>
            </div>
            {selectedRoom && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                Selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Date Range & Guest Box */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40">
        {/* Date Trigger button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsCalendarOpen(!isCalendarOpen);
              setGuestDropdownOpen(false);
            }}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-100/60 transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-primary-light dark:bg-rose-950/60 text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
                <CalendarIcon className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="block text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                  Sanctuary Dates
                </span>
                <span className="text-sm font-heading font-semibold text-neutral-900 dark:text-white">
                  {startDate && endDate
                    ? `${startDate}  →  ${endDate} (${nights} nights)`
                    : "Select check-in & checkout"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-500 transition-transform ${
                isCalendarOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Interactive Calendar Popover */}
          {isCalendarOpen && (
            <div className="p-2 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
              <Calendar
                startDate={startDate}
                endDate={endDate}
                monthsToShow={1}
                onApply={() => setIsCalendarOpen(false)}
                onChange={({ startDate: s, endDate: e }) => {
                  handleDatesUpdate(s, e);
                  if (s && e) {
                    setIsCalendarOpen(false);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Guests selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setGuestDropdownOpen(!guestDropdownOpen);
              setIsCalendarOpen(false);
            }}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-100/60 transition"
          >
            <div>
              <span className="block text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                Guest Party
              </span>
              <span className="text-sm font-heading font-semibold text-neutral-900 dark:text-white">
                {totalGuests} guest{totalGuests > 1 ? "s" : ""}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>

          {guestDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-2xl z-20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading font-semibold text-neutral-900 dark:text-white">
                    Adults
                  </p>
                  <p className="text-xs font-serif text-neutral-500">Age 13+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-xs disabled:opacity-30 hover:border-neutral-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-sans font-semibold w-4 text-center">
                    {adults}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAdults(Math.min(listing.specs.maxGuests, adults + 1))
                    }
                    disabled={totalGuests >= listing.specs.maxGuests}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-xs disabled:opacity-30 hover:border-neutral-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <p className="text-sm font-heading font-semibold text-neutral-900 dark:text-white">
                    Children
                  </p>
                  <p className="text-xs font-serif text-neutral-500">
                    Ages 2–12
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-xs disabled:opacity-30 hover:border-neutral-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-sans font-semibold w-4 text-center">
                    {children}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    disabled={totalGuests >= listing.specs.maxGuests}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-xs disabled:opacity-30 hover:border-neutral-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGuestDropdownOpen(false)}
                className="w-full py-1.5 text-xs font-sans font-semibold text-right text-brand-primary underline"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optional Note for the Host */}
      <div className="space-y-1.5">
        <label className="text-xs font-sans font-semibold text-brand-secondary block uppercase tracking-wider">
          Personal Message for the Host (Optional)
        </label>
        <input
          type="text"
          value={specialNote}
          onChange={(e) => setSpecialNote(e.target.value)}
          placeholder="e.g. Arriving around 7 PM, celebrating birthday"
          className="w-full text-sm font-serif p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      {/* Reserve Action Button */}
      <button
        type="button"
        onClick={handleReserve}
        className="w-full py-4 px-6 cursor-pointer bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-semibold rounded-2xl text-sm shadow-xl shadow-brand-primary/25 hover:shadow-2xl hover:shadow-brand-primary/35 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden group"
      >
        <span className="tracking-wide">Request to Booking</span>
      </button>

      {/* Price Calculations */}
      <div className="space-y-3.5 text-sm font-serif text-neutral-600 dark:text-neutral-400 pt-2 transition-all duration-300">
        <div className="flex justify-between">
          <span>
            {formatPrice(listing.pricePerNight)} x {nights} nights
          </span>
          <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200">
            {formatPrice(basePrice)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200">
            {formatPrice(cleaningFee)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Travistay service fee</span>
          <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200">
            {formatPrice(serviceFee)}
          </span>
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-base text-neutral-900 dark:text-white">
          <span className="font-heading font-semibold text-lg">Estimated total</span>
          <span className="font-heading font-semibold text-xl text-brand-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
