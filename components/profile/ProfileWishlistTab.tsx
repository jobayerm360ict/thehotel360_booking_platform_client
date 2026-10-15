"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, MapPin, ArrowRight } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { formatPrice } from "@/lib/utils";
import { toggleFavorite } from "@/store/slices/favoritesSlice";

import { Badge } from "@/components/ui/badge";

export function ProfileWishlistTab() {
  const dispatch = useAppDispatch();


  const { data: listingData, loading, error, reload } = usePlatformData(platformService.favorites);
  const favoriteListings = listingData || [];


  if (loading && !listingData) {
    return <div className="p-8 text-center text-neutral-500">Loading saved stays…</div>;
  }
  if (error && !listingData) {
    return <div role="alert" className="p-8 text-center">{error}<button className="ml-3 underline" onClick={reload}>Retry</button></div>;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          {/* <div className="flex items-center gap-2 text-brand-secondary text-xs font-sans font-bold uppercase tracking-wider">
            <span>CURATED COLLECTION</span>
          </div> */}
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            Saved stays ({favoriteListings.length})
          </h2>
          {/* <p className="font-serif text-xs text-neutral-500 dark:text-neutral-400 font-light mt-0.5">
            Your personal shortlist of exceptional architectural stays & luxury
            villas.
          </p> */}
        </div>
      </div>

      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteListings.map((listing) => (
            <div
              key={listing.id}
              className="group relative rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-[#fcfbf9] dark:bg-neutral-900/60 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={listing.images?.[0] || "/app.svg"}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  type="button"
                  onClick={() => void dispatch(toggleFavorite(listing.id)).unwrap().then(reload).catch(() => undefined)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 text-rose-500 backdrop-blur-md shadow-xs hover:scale-110 transition cursor-pointer"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white backdrop-blur-md text-[10px] border-none font-sans font-semibold">
                    {listing.specs.propertyType}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 text-xs font-serif text-neutral-500 dark:text-neutral-400">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>
                      {listing.location.city}, {listing.location.country}
                    </span>
                  </p>
                  {listing.reviewCount > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-sans font-bold text-neutral-900 dark:text-white">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{listing.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-neutral-400">No reviews yet</span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">
                  {listing.title}
                </h3>

                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                    {formatPrice(listing.pricePerNight)}{" "}
                    <span className="font-serif font-normal text-xs text-neutral-500">
                      / night
                    </span>
                  </span>
                  <Link
                    href={`/listings/${listing.id}`}
                    className="text-xs font-sans font-semibold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Stay</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 mx-auto">
            <Heart className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="font-heading font-bold text-base text-neutral-800 dark:text-neutral-200">
            Your Wishlist is Empty
          </h3>
          <p className="font-serif text-xs text-neutral-500 max-w-sm mx-auto">
            Tap the heart icon on any sanctuary or luxury villa to save your
            favorite getaways here.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs transition"
            >
              <span>Explore Sanctuaries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
