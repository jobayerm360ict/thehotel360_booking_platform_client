"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/lib/utils";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { Badge } from "@/components/ui/badge";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { HostReservationCard } from "@/components/host/HostReservationCard";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  DollarSign,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  TrendingUp,
  MapPin,
  Star,
  Check,
  X,
  Building2,
  Search,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
  FileSpreadsheet,
  User as UserIcon,
  Award,
  CreditCard,
  Settings,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

function HostDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  const allListings = useAppSelector((state) => state.listings.hostItems);
  const allReservations = useAppSelector((state) => state.booking.reservations);
  const { data: hostMetrics } = usePlatformData(platformService.standards);
  const { data: hostReport, loading: reportLoading } = usePlatformData(platformService.reports);

  // Backward-compatibility: Redirect legacy query params ?tab=... to separate dedicated pages
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "listings") router.replace("/host/listings");
    else if (tab === "messages") router.replace("/host/messages");
    else if (tab === "reports") router.replace("/host/reports");
    else if (tab === "profile") router.replace("/host/profile");
    else if (tab === "standards") router.replace("/host/standards");
  }, [searchParams, router]);

  // The backend returns listings and reservations scoped to the authenticated host.
  const hostedListings = allListings;
  const hostReservations = allReservations;

  // Reservation Filters
  const [selectedListingFilter, setSelectedListingFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateMonthFilter, setDateMonthFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return hostReservations.filter((r) => {
      if (
        selectedListingFilter !== "all" &&
        r.listingId !== selectedListingFilter
      ) {
        return false;
      }
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }
      if (dateMonthFilter !== "all") {
        if (!r.checkIn.startsWith(dateMonthFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.guestName.toLowerCase().includes(q) ||
          r.listingTitle.toLowerCase().includes(q) ||
          r.guestEmail.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [
    hostReservations,
    selectedListingFilter,
    statusFilter,
    dateMonthFilter,
    searchQuery,
  ]);

  const totalRevenue = hostReport?.totalEarnings ?? 0;

  const confirmedCount = hostReservations.filter(
    (r) => r.status === "confirmed",
  ).length;
  const pendingCount = hostReservations.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <HostLayoutWrapper>
      <div className="space-y-3.5 animate-fade-in">
        {/* ========================================================================= */}
        {/* 1. TOP WELCOME & SUMMARY BANNER                                           */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 sm:p-4.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden ring-2 ring-brand-primary/20 dark:ring-neutral-800 shrink-0 shadow-xs">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="font-heading text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                  Welcome back, {user.name}
                </h1>
                {hostMetrics?.isSuperhost && <Badge className="bg-brand-secondary text-white font-sans text-[10px] font-semibold px-2 py-0.2 rounded-full border-none">Superhost</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <Link
              href="/host/create"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2.5 rounded-lg font-sans font-semibold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List New Sanctuary</span>
            </Link>

            <Link
              href="/host/messages"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition shadow-2xs active:scale-98 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
              <span>Chats &amp; Inquiries</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. ANALYTICS KPI STATS                                                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Total Revenue */}
          <Link
            href="/host/reports"
            className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between hover:border-emerald-400 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-brand-secondary uppercase tracking-wider">
                Total Earnings
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">{reportLoading ? "Loading…" : formatPrice(totalRevenue)}</h3>
              <p className="text-[10px] font-sans text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> View Reports &rarr;
              </p>
            </div>
          </Link>

          {/* Active Bookings */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-brand-secondary uppercase tracking-wider">
                Reservations
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {hostReservations.length}
              </h3>
              <p className="text-[10px] font-sans text-neutral-500 mt-0.5">
                {confirmedCount} confirmed • {pendingCount} pending
              </p>
            </div>
          </div>

          {/* Hosted Sanctuaries */}
          <Link
            href="/host/listings"
            className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between hover:border-brand-primary transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-brand-secondary uppercase tracking-wider">
                Sanctuaries
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {hostedListings.length}
              </h3>
              <p className="text-[10px] font-sans text-brand-primary font-medium mt-0.5 flex items-center gap-1">
                Manage Sanctuaries &rarr;
              </p>
            </div>
          </Link>

          {/* Host Rating */}
          <Link
            href="/host/standards"
            className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between hover:border-amber-400 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-brand-secondary uppercase tracking-wider">
                Superhost
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-baseline gap-1">
                <span>{hostMetrics && hostMetrics.reviewCount > 0 ? hostMetrics.rating.toFixed(2) : "—"}</span>
                <span className="text-[11px] font-sans text-neutral-400 font-normal">
                  / 5.0
                </span>
              </h3>
              <p className="text-[10px] font-serif text-amber-700 dark:text-amber-400 mt-0.5">
                {hostMetrics ? hostMetrics.reviewCount + " guest reviews" : "Loading host rating…"}
              </p>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 3. DATE-WISE RESERVATIONS & BOOKINGS                                      */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Left Select Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
              {/* Search text */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guest or stay..."
                  className="w-full text-xs font-sans pl-8 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sanctuary Dropdown */}
              <Select
                value={selectedListingFilter}
                onValueChange={setSelectedListingFilter}
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                  <SelectValue placeholder="All Sanctuaries" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Hosted Sanctuaries</SelectItem>
                  {hostedListings.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title.split("|")[0].trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Dropdown */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Reservation Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed Only</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right Meta Info */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-sans text-neutral-500 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800">
              <span>
                Showing <b>{filteredReservations.length}</b> of
                <b>{hostReservations.length}</b> stays
              </span>

              {(selectedListingFilter !== "all" ||
                statusFilter !== "all" ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedListingFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-brand-primary hover:underline font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 text-center border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mx-auto flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-heading font-bold text-sm text-neutral-800 dark:text-neutral-200">
                No Reservations Match Your Criteria
              </h3>
              <p className="text-xs font-serif text-neutral-500 max-w-sm mx-auto">
                Try clearing your search query or changing the listing/status
                filter to see upcoming bookings.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReservations.map((res) => (
                <HostReservationCard key={res.id} reservation={res} />
              ))}
            </div>
          )}
        </div>
      </div>
    </HostLayoutWrapper>
  );
}

export default function HostDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HostDashboardContent />
    </Suspense>
  );
}
