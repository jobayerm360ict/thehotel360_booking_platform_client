"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cancelReservation } from "@/store/slices/bookingSlice";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { formatPrice } from "@/lib/utils";
import {
  Luggage,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  Search,
  Download,
  ShieldCheck,
  Compass,
  AlertCircle,
  X,
  MoveLeft,
  Star,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GuestReviewModal } from "@/components/modals/GuestReviewModal";
import { PaymentReturnNotice } from "@/components/booking/PaymentReturnNotice";
import { Reservation } from "@/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function TripsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isBengali } = useTranslation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loadGuestTrips = useCallback(
    () => isAuthenticated ? platformService.trips() : Promise.resolve([]),
    [isAuthenticated],
  );
  const { data: tripData, loading: tripsLoading, error: tripsError, reload: reloadTrips } = usePlatformData(loadGuestTrips);




  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [itineraryToast, setItineraryToast] = useState<string | null>(null);
  const [reviewingReservation, setReviewingReservation] = useState<Reservation | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Wait for client hydration before reading browser auth state.
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      if (!isAuthenticated && !token) {
        router.push("/");
      }
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3 animate-pulse"
              >
                <div className="h-44 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const myReservations = tripData || [];

  // Filter reservations by status and search query
  const filteredReservations = myReservations.filter((res) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "confirmed"
          ? res.status === "confirmed" || res.status === "pending"
          : activeTab === "completed"
            ? res.status === "completed"
            : res.status === activeTab;

    const matchesSearch =
      searchQuery.trim() === "" ||
      res.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (tripsLoading && !tripData) {
    return <div className="min-h-[50vh] p-8 text-center text-neutral-500">Loading your reservations…</div>;
  }
  if (tripsError && !tripData) {
    return <div role="alert" className="m-6 rounded-xl border p-6 text-center">{tripsError}<button className="ml-3 underline" onClick={reloadTrips}>Retry</button></div>;
  }
  // Calculate high level metrics
  const confirmedCount = myReservations.filter(
    (r) => r.status === "confirmed",
  ).length;
  const completedCount = myReservations.filter(
    (r) => r.status === "completed",
  ).length;
  const totalNights = myReservations
    .filter((r) => r.status !== "cancelled")
    .reduce((acc, r) => acc + (r.nights || 1), 0);

  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownloadItinerary = (id: string) => {
    const reservation = myReservations.find((item) => item.id === id);
    if (!reservation) return;
    const details = [
      "Travistay reservation itinerary",
      "Confirmation ID: " + reservation.id,
      "Property: " + reservation.listingTitle,
      "Location: " + reservation.location,
      "Check-in: " + formatLongDate(reservation.checkIn),
      "Check-out: " + formatLongDate(reservation.checkOut),
      "Guests: " + (reservation.guests.adults + reservation.guests.children + reservation.guests.infants),
      "Nights: " + reservation.nights,
      "Reservation total: " + formatPrice(reservation.totalPrice),
      "Status: " + reservation.status,
    ].join(String.fromCharCode(10));
    const url = URL.createObjectURL(new Blob([details], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "travistay-itinerary-" + reservation.id.replace(/[^a-zA-Z0-9_-]/g, "") + ".txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setItineraryToast("Itinerary downloaded");
    setTimeout(() => setItineraryToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Toast feedback */}
        {itineraryToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-sans font-semibold animate-in fade-in slide-in-from-bottom-4">
            <span>{itineraryToast}</span>
          </div>
        )}

        <PaymentReturnNotice onUpdated={reloadTrips} />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-brand-secondary text-xs font-sans font-bold uppercase tracking-wider mb-2">
              <Link href="/profile" className="mr-2">
                <MoveLeft className="w-10 h-10 text-brand-primary bg-brand-primary/10 p-2 rounded-full" />
              </Link>
              <Compass className="w-4 h-4 text-brand-primary" />
              <span>TRAVISTAY ITINERARY &amp; EXPEDITIONS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-neutral-900 dark:text-white tracking-tight">
              {isBengali ? "আপনার বুকিং ও সফরসমূহ" : "Your Reserved Journeys"}
            </h1>
            <p className="text-sm font-serif text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xl font-light">
              {isBengali
                ? "বুকিংয়ের তারিখ, ইনভয়েস, হোস্টের সাথে যোগাযোগ ও সম্পন্ন হওয়া সফরের পর রিভিউ দিন।"
                : "Manage your confirmed sanctuary stays, host communications, arrival check-ins, and leave verified reviews."}
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
              <span className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider">
                {isBengali ? "কনফার্মড স্টে" : "Confirmed Stays"}
              </span>
              <span className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
                {confirmedCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
              <span className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider">
                {isBengali ? "সম্পূর্ণ সফর" : "Completed"}
              </span>
              <span className="font-heading font-bold text-lg text-emerald-600 dark:text-emerald-400">
                {completedCount}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
              <span className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider">
                {isBengali ? "মোট রাত" : "Total Nights"}
              </span>
              <span className="font-heading font-bold text-lg text-brand-primary">
                {totalNights}
              </span>
            </div>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-md shadow-brand-primary/20 transition-all hover:scale-102 active:scale-98"
            >
              <span>{isBengali ? "নতুন স্থান খুঁজুন" : "Explore Sanctuaries"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 w-full sm:w-auto overflow-x-auto">
            {[
              { id: "all", label: isBengali ? "সকল সফর" : "All Journeys" },
              { id: "confirmed", label: isBengali ? "আসন্ন ও নিশ্চিত" : "Upcoming & Confirmed" },
              { id: "completed", label: isBengali ? "সম্পন্ন ও অতীত" : "Completed & Past" },
              { id: "cancelled", label: isBengali ? "বাতিলকৃত" : "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBengali ? "নাম, লোকেশন বা আইডি খুঁজুন..." : "Search by name, place, ID..."}
              className="w-full text-xs font-sans pl-9 pr-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Trips List */}
        {filteredReservations.length > 0 ? (
          <div className="space-y-6">
            {filteredReservations.map((res) => (
              <div
                key={res.id}
                className="group relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
              >
                {/* Left Side: Editorial Image & Badges */}
                <div className="relative md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={res.listingImage || "/app.svg"}
                    alt={res.listingTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 md:hidden" />

                  {/* Badges on image */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
                    {res.status === "completed" ? (
                      <Badge className="bg-emerald-600/95 hover:bg-emerald-600 text-white font-sans font-bold text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-md border-none flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isBengali ? "সফর সম্পূর্ণ" : "Stay Completed"}</span>
                      </Badge>
                    ) : res.status === "confirmed" ? (
                      <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white font-sans font-bold text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-md border-none flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isBengali ? "নিশ্চিত বুকিং" : "Confirmed Sanctuary"}</span>
                      </Badge>
                    ) : res.status === "pending" ? (
                      <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white font-sans font-bold text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-md border-none flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isBengali ? "পেমেন্টের অপেক্ষায়" : "Awaiting Payment"}</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/90 hover:bg-rose-500 text-white font-sans font-bold text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-md border-none flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isBengali ? "বাতিল" : "Cancelled"}</span>
                      </Badge>
                    )}

                    {res.isReviewed && (
                      <Badge className="bg-amber-500 text-white font-sans font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md border-none flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span>{isBengali ? `রিভিউ দেওয়া হয়েছে (${res.reviewRating}★)` : `Reviewed (${res.reviewRating}★)`}</span>
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 md:bottom-3.5 md:left-3.5">
                    <span className="bg-black/60 text-white font-sans font-semibold text-xs px-3 py-1 rounded-xl backdrop-blur-md border border-white/10">
                      {res.nights} {isBengali ? "রাত অবস্থান" : "Nights Stay"}
                    </span>
                  </div>
                </div>

                {/* Right Side: Itinerary & Booking Details */}
                <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-5">
                  {(res.status === "pending" || res.status === "confirmed") && (res.remainingAmount || 0) > 0 && (
                    <Link className="inline-block rounded-xl bg-brand-primary text-white px-4 py-2 mb-3 text-sm"
                      href={"/book/" + res.listingId + "?reservationId=" + res.id}>
                      {(res.paidAmount || 0) > 0 ? "Pay remaining balance" : "Complete payment"}
                    </Link>
                  )}
                  {/* Top Bar: Code + Date + Price */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-sans font-bold text-brand-secondary uppercase tracking-wider">
                          {isBengali ? "কনফার্মেশন" : "CONFIRMATION"}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                          #TRV-{res.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-neutral-400 font-serif font-light mr-1.5">
                          {isBengali ? "মোট পরিশোধ:" : "Total Paid:"}
                        </span>
                        <span className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
                          {formatPrice(res.paidAmount ?? 0)}
                        </span>
                      </div>
                    </div>

                    {/* Title & Location */}
                    <div className="mt-3.5 space-y-1">
                      <Link
                        href={`/listings/${res.listingId}`}
                        className="group-hover:text-brand-primary transition-colors"
                      >
                        <h3 className="font-heading font-semibold text-xl text-neutral-900 dark:text-white line-clamp-1">
                          {res.listingTitle}
                        </h3>
                      </Link>
                      <p className="flex items-center gap-1.5 text-xs font-serif text-neutral-500 dark:text-neutral-400 font-light">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span>{res.location}</span>
                      </p>
                    </div>

                    {/* Key Itinerary Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                      {/* Check-in */}
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/60">
                        <span className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider">
                          {isBengali ? "চেক-ইন তারিখ" : "Check-in Date"}
                        </span>
                        <span className="block text-xs font-sans font-semibold text-neutral-900 dark:text-white mt-0.5 truncate">
                          {formatLongDate(res.checkIn)}
                        </span>
                      </div>

                      {/* Checkout */}
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/60">
                        <span className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider">
                          {isBengali ? "চেক-আউট তারিখ" : "Checkout Date"}
                        </span>
                        <span className="block text-xs font-sans font-semibold text-neutral-900 dark:text-white mt-0.5 truncate">
                          {formatLongDate(res.checkOut)}
                        </span>
                      </div>

                      {/* Guests & Party */}
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/60">
                        <span className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider">
                          {isBengali ? "অতিথি সংখ্যা" : "Reserved Party"}
                        </span>
                        <span className="block text-xs font-sans font-semibold text-neutral-900 dark:text-white mt-0.5 truncate">
                          {res.guests.adults + res.guests.children} {isBengali ? "অতিথি" : "Guests"} (
                          {res.guests.adults} {isBengali ? "প্রাপ্তবয়স্ক" : "Adults"})
                        </span>
                      </div>
                    </div>

                    {/* Optional Note / Special Requests */}
                    {res.specialRequests && (
                      <div className="mt-3 px-3.5 py-2 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/15 text-xs font-serif text-neutral-700 dark:text-neutral-300">
                        <span className="font-sans font-semibold text-brand-primary mr-1.5">
                          Host Note:
                        </span>
                        <span>{res.specialRequests}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/listings/${res.listingId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                      >
                        <span>{isBengali ? "লিস্টিং দেখুন" : "Sanctuary Details"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDownloadItinerary(res.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-sans font-semibold transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isBengali ? "ইনভয়েস" : "Itinerary"}</span>
                      </button>

                      {/* Review Actions for Completed stays */}
                      {res.status === "completed" ? (
                        !res.isReviewed ? (
                          <button
                            type="button"
                            onClick={() => setReviewingReservation(res)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-sans font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                          >
                            <Star className="w-3.5 h-3.5 fill-white text-white" />
                            <span>{isBengali ? "রিভিউ লিখুন" : "Write a Review"}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-sans font-semibold border border-amber-200/60 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{isBengali ? `রিভিউ দেওয়া হয়েছে (${res.reviewRating}★)` : `Reviewed (${res.reviewRating}★)`}</span>
                          </span>
                        )
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      

                      {(res.status === "pending" || res.status === "confirmed") && (
                        <button
                          type="button"
                          onClick={() => setCancellingId(res.id)}
                          className="inline-flex items-center gap-1 text-xs font-sans font-medium text-neutral-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel Stay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto flex flex-col items-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-10 shadow-sm animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary-light dark:bg-rose-950/40 text-brand-primary flex items-center justify-center mb-4 border border-brand-primary/20">
              <Luggage className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-neutral-900 dark:text-white">
              {isBengali ? "কোনো সফর পাওয়া যায়নি" : "No Reserved Journeys Found"}
            </h3>
            <p className="text-xs font-serif text-neutral-500 dark:text-neutral-400 mt-2 mb-6 leading-relaxed font-light">
              {searchQuery
                ? `No reservations matching "${searchQuery}". Try adjusting your search or filter.`
                : "You haven't reserved any sanctuaries yet. Start discovering verified coastal villas, tea sanctuaries, and cloud retreats."}
            </p>
            <Link
              href="/"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-semibold px-7 py-3 rounded-2xl text-xs shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/35 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              {isBengali ? "লিস্টিং ব্রাউজ করুন" : "Discover Curated Stays"}
            </Link>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200/60">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-lg text-neutral-900 dark:text-white">
                  Cancel this Reservation?
                </h3>
                <p className="text-xs font-serif text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                  Are you sure you want to cancel? This will release your reserved dates. Any refund depends on the reservation&apos;s cancellation policy.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  onClick={async () => { try { await dispatch(cancelReservation(cancellingId)).unwrap(); await reloadTrips(); setCancellingId(null); } catch { /* Keep cancellation open */ } }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-sans font-semibold shadow-md shadow-rose-600/20 transition cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guest Review Modal */}
        <GuestReviewModal
          open={Boolean(reviewingReservation)}
          onOpenChange={(open) => !open && setReviewingReservation(null)}
          reservation={reviewingReservation}
          onSuccess={() => {
            reloadTrips();
            setItineraryToast(isBengali ? "রিভিউ সফলভাবে জমা হয়েছে!" : "Review published successfully!");
            setTimeout(() => setItineraryToast(null), 3000);
          }}
        />
      </div>
    </div>
  );
}
