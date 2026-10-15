"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Luggage, Star } from "lucide-react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GuestReviewModal } from "@/components/modals/GuestReviewModal";
import type { Reservation } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function ProfileBookingsTab() {
  const { isBengali } = useTranslation();
  const { data, loading, error, reload } = usePlatformData(platformService.trips);
  const reservations = data || [];
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviewingReservation, setReviewingReservation] = useState<Reservation | null>(null);

  if (loading && !data) {
    return <div className="rounded-2xl border bg-white p-8 text-center text-neutral-500 dark:bg-neutral-900">Loading your bookings…</div>;
  }
  if (error && !data) {
    return <div role="alert" className="rounded-2xl border bg-white p-8 text-center dark:bg-neutral-900">{error}<button className="ml-3 underline" onClick={reload}>Retry</button></div>;
  }

  const filteredReservations = filterStatus === "all"
    ? reservations
    : reservations.filter((reservation) => reservation.status === filterStatus);

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
          {isBengali ? "আমার বুকিং" : "My bookings"}
        </h2>
        <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          {[
            { id: "all", label: isBengali ? "সব" : "All" },
            { id: "pending", label: isBengali ? "পেন্ডিং" : "Pending" },
            { id: "confirmed", label: isBengali ? "নিশ্চিত" : "Confirmed" },
            { id: "completed", label: isBengali ? "সম্পন্ন" : "Completed" },
            { id: "cancelled", label: isBengali ? "বাতিল" : "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={"rounded-lg px-3 py-1 text-xs font-semibold transition " + (filterStatus === tab.id ? "bg-white text-brand-primary shadow-xs dark:bg-neutral-900" : "text-neutral-500")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredReservations.length ? (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <article key={reservation.id} className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-[#fcfbf9] dark:border-neutral-800 dark:bg-neutral-900/60 sm:flex-row">
              <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-52">
                <img src={reservation.listingImage || "/app.svg"} alt={reservation.listingTitle} className="h-full w-full object-cover" />
                <Badge className="absolute left-3 top-3 capitalize">{reservation.status}</Badge>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary">
                      Reservation #{reservation.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="font-heading text-base font-bold text-neutral-900 dark:text-white">
                      {formatPrice(reservation.totalPrice)}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-neutral-900 dark:text-white">
                    {reservation.listingTitle}
                  </h3>
                  <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {reservation.location}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1">
                      <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                      {reservation.checkIn} – {reservation.checkOut} ({reservation.nights} {isBengali ? "রাত" : "nights"})
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1">
                      <Users className="h-3.5 w-3.5 text-brand-secondary" />
                      {reservation.guests.adults + reservation.guests.children + reservation.guests.infants} {isBengali ? "অতিথি" : "guests"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/60 pt-3 dark:border-neutral-800">
                  <Link href={"/listings/" + reservation.listingId} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline">
                    {isBengali ? "লিস্টিং দেখুন" : "View stay details"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {(reservation.status === "pending" || reservation.status === "confirmed") && (reservation.remainingAmount || 0) > 0 && (
                    <Link href={"/book/" + reservation.listingId + "?reservationId=" + reservation.id}
                      className="inline-flex items-center rounded-xl bg-brand-primary px-3.5 py-1.5 text-xs font-semibold text-white">
                      {(reservation.paidAmount || 0) > 0 ? "Pay remaining balance" : "Complete payment"}
                    </Link>
                  )}                  {reservation.status === "completed" && (
                    reservation.isReviewed ? (
                      <Badge className="inline-flex items-center gap-1 border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {isBengali ? "রিভিউ দেওয়া হয়েছে" : "Reviewed"}
                      </Badge>
                    ) : (
                      <button type="button" onClick={() => setReviewingReservation(reservation)} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-600">
                        <Star className="h-3.5 w-3.5 fill-white" />
                        {isBengali ? "রিভিউ লিখুন" : "Write a review"}
                      </button>
                    )
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-3 py-16 text-center">
          <Luggage className="mx-auto h-8 w-8 text-neutral-400" />
          <h3 className="font-heading font-bold text-neutral-800 dark:text-neutral-200">
            {isBengali ? "কোনো বুকিং পাওয়া যায়নি" : "No bookings found"}
          </h3>
          <p className="mx-auto max-w-sm text-xs text-neutral-500">
            {isBengali ? "আপনার বুকিংগুলো এখানে দেখা যাবে।" : "Your reservations will appear here."}
          </p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-xs font-semibold text-white">
            {isBengali ? "থাকা খুঁজুন" : "Explore stays"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <GuestReviewModal
        open={Boolean(reviewingReservation)}
        onOpenChange={(open) => !open && setReviewingReservation(null)}
        reservation={reviewingReservation}
        onSuccess={reload}
      />
    </section>
  );
}