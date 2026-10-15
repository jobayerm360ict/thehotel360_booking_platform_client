"use client";

import React, { useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loadFavorites = useCallback(
    () => isAuthenticated ? platformService.favorites() : Promise.resolve([]),
    [isAuthenticated],
  );
  const { data: favoriteData, loading, error, reload } = usePlatformData(loadFavorites);
  const favoriteListings = favoriteData || [];



  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-4 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-neutral-800 animate-fade-in-down">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Saved Sanctuaries</span>
              <Heart className="w-7 h-7 text-brand-primary fill-brand-primary animate-pulse" />
            </h1>
            <p className="text-sm font-serif text-neutral-500 dark:text-neutral-400 mt-1.5 font-light">
              {favoriteData ? favoriteListings.length : "—"}{" "}
              {favoriteListings.length === 1
                ? "sanctuary saved"
                : "sanctuaries saved"}{" "}
              for your upcoming retreats
            </p>
          </div>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 text-sm font-sans font-semibold text-brand-primary hover:underline transition-all duration-200 hover:translate-x-1 cursor-pointer"
          >
            <span>Explore more sanctuaries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isAuthenticated && loading && !favoriteData && (
          <p className="py-12 text-center text-neutral-500">Loading saved stays…</p>
        )}
        {isAuthenticated && error && !favoriteData && (
          <div role="alert" className="py-12 text-center text-sm text-rose-600">
            {error}<button className="ml-3 underline" onClick={reload}>Retry</button>
          </div>
        )}
        {!isAuthenticated && (
          <div className="py-12 text-center text-neutral-500">Sign in to view your saved stays.</div>
        )}
        {/* Saved Listings Grid or Empty State */}
        {isAuthenticated && !loading && !error && favoriteListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-12 py-6 animate-fade-in-up">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : isAuthenticated && !loading && !error ? (
          <div className="py-24 text-center max-w-md mx-auto flex flex-col items-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-3xl bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4 shadow-xs animate-bounce">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-neutral-900 dark:text-white">
              Your wishlist is empty
            </h3>
            <p className="text-sm font-serif text-neutral-500 mt-1.5 mb-6 font-light">
              As you discover stays, tap the heart icon on any villa, cliffside
              retreat, or cabin to curate your collection here.
            </p>
            <Link
              href="/"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-semibold px-7 py-3.5 rounded-2xl text-sm shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Start Exploring
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
