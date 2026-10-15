"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  LocateFixed,
} from "lucide-react";
import { Listing } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { setQuickViewListingId } from "@/store/slices/uiSlice";
import { formatPrice } from "@/lib/utils";
import { formatDistance } from "@/lib/geolocation";

interface ListingCardProps {
  listing: Listing;
  distanceKm?: number;
}

export function ListingCard({ listing, distanceKm }: ListingCardProps) {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const isFavorite = favoriteIds.includes(listing.id);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + listing.images.length) % listing.images.length,
    );
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(listing.id));
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setQuickViewListingId(listing.id));
  };

  return (
    <div className="group relative flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/listings/${listing.id}`} className="flex flex-col">
        {/* Large Curated Photo Canvas */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[1rem]  dark:bg-neutral-800  group-hover:shadow-xl transition-all duration-300 border border-neutral-200/60 dark:border-neutral-800">
          <Image
            src={listing.images[currentImageIndex] || listing.images[0]}
            alt={listing.title}
            fill
            sizes="(max-width: 520px) 100vw, (max-width: 680px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 bg-brand-primary text-white shadow-md font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full animate-in fade-in">
                <LocateFixed className="w-3 h-3" />
                <span>{formatDistance(distanceKm)}</span>
              </span>
            )}
            {listing.isGuestFavorite && (
              <span className="inline-flex items-center gap-1 bg-white/95 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 shadow-sm backdrop-blur-md font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-neutral-200/60">
                <span>Guest Favorite</span>
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleFavorite}
            aria-label="Save to favorites"
            className="absolute top-1 right-1 p-2 rounded-full cursor-pointer hover:scale-125 active:scale-90 transition-all duration-300 z-10"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 drop-shadow-md ${
                isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-white fill-black/20 hover:fill-black/40 hover:scale-105"
              }`}
            />
          </button>

          {/* Quick View Hover Pill */}
          <button
            type="button"
            onClick={handleQuickView}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-white/95 hover:bg-white text-neutral-900 px-2 py-1 rounded-full shadow-lg backdrop-blur-md z-10 flex items-center gap-1.5 text-[11px] font-sans font-semibold border border-neutral-200/80"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-700" />
            <span>Quick view</span>
          </button>

          {/* Image Navigation Arrows */}
          {listing.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {currentImageIndex < listing.images.length - 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Carousel Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {listing.images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "w-2 h-2 bg-white scale-110 shadow-xs"
                        : "w-1.5 h-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Listing Meta Information */}
        <div className="mt-3.5 flex flex-col gap-1 px-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-heading font-semibold text-base text-neutral-900 dark:text-white truncate">
              {listing.location.city}, {listing.location.country}
            </h3>
            <div className="flex items-center gap-1 font-sans text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
              <Star className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" />
              <span>{listing.rating.toFixed(2)}</span>
            </div>
          </div>

          {distanceKm !== undefined && (
            <p className="text-[11px] font-sans font-medium text-brand-primary flex items-center gap-1">
              <LocateFixed className="w-3 h-3" />
              <span>{formatDistance(distanceKm)} from your location</span>
            </p>
          )}

          {/* <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif italic truncate">
            {listing.tagline || listing.title}
          </p> */}

          <p className="text-xs text-neutral-500 font-sans">
            {listing.specs.bedrooms} bedrooms · {listing.specs.bathrooms} baths
            · {listing.specs.maxGuests} guests
          </p>

          {/* Pricing */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
              {formatPrice(listing.pricePerNight)}
            </span>
            <span className="text-xs text-neutral-500 font-sans">/ night</span>
            {listing.originalPrice && (
              <span className="text-xs text-neutral-400 line-through font-sans">
                {formatPrice(listing.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
