"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuickViewListingId } from "@/store/slices/uiSlice";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { formatPrice } from "@/lib/utils";
import {
  Star,
  Heart,
  MapPin,
  Users,
  Bed,
  Bath,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ListingQuickViewModal() {
  const dispatch = useAppDispatch();
  const quickViewId = useAppSelector((state) => state.ui.quickViewListingId);
  const listings = useAppSelector((state) => state.listings.items);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);

  const listing = listings.find((l) => l.id === quickViewId);
  const isFavorite = listing ? favoriteIds.includes(listing.id) : false;
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!listing) return null;

  return (
    <Dialog
      open={Boolean(quickViewId)}
      onOpenChange={(open) => {
        if (!open) {
          dispatch(setQuickViewListingId(null));
          setActivePhotoIdx(0);
        }
      }}
    >
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden max-h-[90vh] flex flex-col md:flex-row bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl rounded-3xl"
        onClose={() => {
          dispatch(setQuickViewListingId(null));
          setActivePhotoIdx(0);
        }}
      >
        {/* Left Column: Photo Gallery Preview */}
        <div className="md:w-1/2 bg-neutral-950 flex flex-col justify-between relative min-h-[280px] md:min-h-[460px]">
          <div className="relative w-full h-[260px] md:h-full">
            <Image
              src={listing.images[activePhotoIdx] || listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Favorite button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(toggleFavorite(listing.id));
              }}
              className="absolute top-4 left-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition cursor-pointer z-10"
            >
              <Heart
                className={`w-4 h-4 transition ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-white"
                }`}
              />
            </button>

            {/* Rare Find or Category Badge */}
            <div className="absolute bottom-4 left-4 z-10">
              <Badge className="bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white backdrop-blur-md border border-white/20 text-xs px-3 py-1 font-heading">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5 inline" />
                {listing.category}
              </Badge>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-xl">
              {listing.images.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-8 h-8 rounded-lg overflow-hidden border transition cursor-pointer ${
                    activePhotoIdx === idx
                      ? "border-brand-primary ring-2 ring-brand-primary/50 scale-105"
                      : "border-white/30 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt="thumbnail"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Listing Details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[460px]">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-sans text-neutral-500 dark:text-neutral-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>
                  {listing.location.city}, {listing.location.country}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <div className="flex items-center gap-1 text-neutral-900 dark:text-white font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{listing.rating.toFixed(2)}</span>
                  <span className="text-neutral-400 font-normal">
                    ({listing.reviewCount})
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-heading font-bold text-neutral-900 dark:text-white leading-tight">
                {listing.title}
              </h3>
            </div>

            {/* Room specs */}
            <div className="flex items-center gap-4 py-3 border-y border-neutral-100 dark:border-neutral-800 text-xs font-sans text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-neutral-400" />
                <span>{listing.specs.maxGuests} Guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-neutral-400" />
                <span>{listing.specs.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-neutral-400" />
                <span>{listing.specs.bathrooms} Baths</span>
              </div>
            </div>

            {/* Description excerpt */}
            <p className="text-xs font-serif text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
              {listing.description}
            </p>

            {/* Host info */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <Image
                  src={listing.host.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                  alt={listing.host.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-xs">
                <p className="font-heading font-semibold text-neutral-900 dark:text-white">
                  Hosted by {listing.host.name}
                </p>
                <p className="text-neutral-400 font-serif">
                  {listing.host.joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Footer with Price and View Full Listing Button */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-heading font-semibold text-neutral-900 dark:text-white">
                  {formatPrice(listing.pricePerNight)}
                </span>
                <span className="text-xs font-sans text-neutral-500">
                  / night
                </span>
              </div>
              <p className="text-[11px] font-serif text-neutral-400">
                Direct booking guarantee
              </p>
            </div>

            <Link
              href={`/listings/${listing.id}`}
              onClick={() => dispatch(setQuickViewListingId(null))}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-3 rounded-2xl font-sans font-semibold text-xs shadow-lg shadow-brand-primary/20 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Explore Sanctuary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
