"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { updateReservationStatus } from "@/store/slices/bookingSlice";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from "lucide-react";
import { Reservation } from "@/types";

interface HostReservationCardProps {
  reservation: Reservation;
}

export function HostReservationCard({
  reservation: res,
}: HostReservationCardProps) {
  const dispatch = useAppDispatch();
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const formatStayDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (res.status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-sans text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-sans text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Approval
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 font-sans text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Cancelled
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-sans text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const totalGuestCount =
    (res.guests?.adults || 0) +
    (res.guests?.children || 0) +
    (res.guests?.infants || 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 overflow-hidden">
      {/* 1. Header Bar: Guest Identity & Status */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-neutral-800 shadow-2xs">
            <Image
              src={
                res.guestAvatar ||
                "/app.svg"
              }
              alt={res.guestName}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                {res.guestName}
              </h4>
            </div>
            {res.guestEmail && (
              <p className="text-xs font-sans text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{res.guestEmail}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Sanctuary Details & Dates */}
          <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
            <div className="relative w-full sm:w-28 md:w-32 h-36 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={res.listingImage}
                alt={res.listingTitle}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 sm:hidden bg-neutral-950/70 backdrop-blur-xs text-white text-[10px] font-sans font-medium px-2 py-0.5 rounded-full">
                #{res.id}
              </div>
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              <div>
                <h5 className="font-heading font-semibold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1 group-hover:text-brand-primary">
                  {res.listingTitle}
                </h5>
                {res.location && (
                  <p className="text-xs font-serif text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-brand-secondary shrink-0" />
                    <span>{res.location}</span>
                  </p>
                )}
              </div>

              {/* Stay Dates Pill & Guest Count */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-sans font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span>
                    {formatStayDate(res.checkIn)} &mdash;{" "}
                    {formatStayDate(res.checkOut)}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-brand-primary font-semibold">
                    {res.nights} {res.nights === 1 ? "Night" : "Nights"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-sans font-medium">
                  <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>
                    {totalGuestCount}{" "}
                    {totalGuestCount === 1 ? "Guest" : "Guests"}
                    {res.guests?.adults ? ` (${res.guests.adults}A` : ""}
                    {res.guests?.children ? `, ${res.guests.children}C` : ""}
                    {res.guests?.adults ? ")" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation total */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center p-3 sm:p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 md:min-w-[140px] shrink-0">
            <span className="text-[11px] font-sans font-medium text-emerald-800 dark:text-emerald-300">
              Reservation Total
            </span>
            <div className="text-right">
              <span className="font-heading font-bold text-lg sm:text-xl text-emerald-700 dark:text-emerald-400">
                {formatPrice(res.totalPrice)}
              </span>
              <button
                type="button"
                onClick={() => setShowPriceDetails(!showPriceDetails)}
                className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-end gap-0.5 ml-auto mt-0.5"
              >
                <span>Breakdown</span>
                {showPriceDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Price Breakdown */}
        {showPriceDetails && (
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-750 text-xs font-sans space-y-1.5 animate-fade-in">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>
                {formatPrice(res.pricePerNight)} × {res.nights} nights
              </span>
              <span>{formatPrice(res.pricePerNight * res.nights)}</span>
            </div>
            {res.cleaningFee > 0 && (
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Cleaning Fee</span>
                <span>{formatPrice(res.cleaningFee)}</span>
              </div>
            )}
            {res.serviceFee > 0 && (
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Service &amp; Ops Fee</span>
                <span>{formatPrice(res.serviceFee)}</span>
              </div>
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-1.5 flex justify-between font-bold text-neutral-900 dark:text-white">
              <span>Reservation Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatPrice(res.totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Guest Note / Special Requests if any */}
        {res.specialRequests && (
          <div className="px-3.5 py-2.5 rounded-md bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <div className="min-w-0">
              <span className="font-sans font-bold text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-300 block">
                Guest Special Note:
              </span>
              <p className="font-serif italic mt-0.5 text-neutral-700 dark:text-neutral-300">
                &ldquo;{res.specialRequests}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* 3. Action Buttons (Optimized for Mobile & Desktop) */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-[11px] font-sans text-neutral-400 hidden lg:block">
            Booked on {formatStayDate(res.createdAt)}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Message Button */}
            <Link
              href="/host/messages"
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
              title="Message this guest"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </Link>

            {/* Accept Stay (If pending) */}
            {res.status === "pending" && (
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    updateReservationStatus({
                      id: res.id,
                      status: "confirmed",
                    }),
                  )
                }
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold transition-all shadow-xs active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Stay</span>
              </button>
            )}

            {/* Decline / Cancel Actions */}
            {res.status === "pending" && (
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    updateReservationStatus({
                      id: res.id,
                      status: "declined",
                    }),
                  )
                }
                className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-sans font-medium transition cursor-pointer"
                title="Decline Reservation"
              >
                Decline
              </button>
            )}

            {res.status === "confirmed" && (
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    updateReservationStatus({
                      id: res.id,
                      status: "cancelled",
                    }),
                  )
                }
                className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-sans font-medium transition cursor-pointer"
                title="Cancel Reservation"
              >
                Cancel Stay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
