"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { Building2, PlusCircle, Search } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { HostListingCard } from "@/components/host/HostListingCard";
import { Badge } from "@/components/ui/badge";

function HostListingsContent() {
  const allListings = useAppSelector((state) => state.listings.hostItems);
  const [searchQuery, setSearchQuery] = useState("");

  const hostedListings = allListings;

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return hostedListings;
    const q = searchQuery.toLowerCase();
    return hostedListings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.location.city.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q),
    );
  }, [hostedListings, searchQuery]);

  return (
    <HostLayoutWrapper>
      <div className="space-y-3 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 sm:p-4.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Hosted Sanctuaries</span>
              <Badge className="bg-brand-primary text-white font-sans text-[10px] px-2 py-0.2 rounded-full border-none">
                {hostedListings.length} Listings
              </Badge>
            </h1>
          </div>

          <Link
            href="/host/create"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs transition-all active:scale-98 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List New Sanctuary</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-2.5 sm:p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by sanctuary name or city..."
              className="w-full text-xs font-sans pl-8 pr-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <span className="text-xs font-sans text-neutral-400 hidden sm:inline">
            Showing {filteredListings.length} of {hostedListings.length}{" "}
            properties
          </span>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredListings.map((listing) => (
            <HostListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </HostLayoutWrapper>
  );
}

export default function HostListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HostListingsContent />
    </Suspense>
  );
}
