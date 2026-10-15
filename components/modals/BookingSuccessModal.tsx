"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearBookingSuccess } from "@/store/slices/bookingSlice";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

export function BookingSuccessModal() {
  const dispatch = useAppDispatch();
  const recentBooking = useAppSelector(
    (state) => state.booking.recentBookingSuccess,
  );

  if (!recentBooking) return null;

  return (
    <Dialog
      open={Boolean(recentBooking)}
      onOpenChange={(open) => !open && dispatch(clearBookingSuccess())}
    >
      <DialogContent
        className="max-w-lg p-0 overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl"
        onClose={() => dispatch(clearBookingSuccess())}
      >
        {/* Header Banner */}
        <div className="bg-brand-primary text-white p-7 text-center relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-heading font-bold">
            Sanctuary Reserved!
          </h2>
          <p className="text-xs font-serif text-white/90 mt-1">
            Confirmation #{recentBooking.id.toUpperCase()}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Listing Preview Card */}
          <div className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
              <Image
                src={recentBooking.listingImage}
                alt={recentBooking.listingTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-bold text-neutral-900 dark:text-white text-sm truncate">
                {recentBooking.listingTitle}
              </h4>
              <p className="text-xs text-neutral-500 font-serif flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span className="truncate">{recentBooking.location}</span>
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-sans text-neutral-600 dark:text-neutral-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {recentBooking.checkIn} – {recentBooking.checkOut}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  {recentBooking.guests.adults + recentBooking.guests.children}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-2 text-xs font-sans">
            <div className="flex justify-between text-neutral-500">
              <span>Status</span>
              <span className="font-semibold text-emerald-600 uppercase tracking-wider text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {recentBooking.status}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Duration</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {recentBooking.nights} nights
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-brand-primary">
                {formatPrice(recentBooking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => dispatch(clearBookingSuccess())}
              className="flex-1 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-sans font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Close
            </button>
            <Link
              href="/trips"
              onClick={() => dispatch(clearBookingSuccess())}
              className="flex-1 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>View My Trips</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
