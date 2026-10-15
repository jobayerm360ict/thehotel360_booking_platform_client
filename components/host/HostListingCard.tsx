"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  ExternalLink,
  Users,
  Bed,
  Bath,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Listing } from "@/types";

interface HostListingCardProps {
  listing: Listing;
}

export function HostListingCard({ listing }: HostListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["/app.svg"];

  // Auto-slide loop effect (pauses on hover)
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe left -> next in loop
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe right -> prev in loop
        setCurrentImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Photo Carousel & Badges */}
        <div
          className="relative h-52 sm:h-56 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Smooth Crossfade Images Slider */}
          {images.map((imgSrc, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentImageIndex
                  ? "opacity-100 z-1"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={imgSrc}
                alt={`${listing.title} photo ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={idx === 0}
              />
            </div>
          ))}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">

            {listing.isGuestFavorite && (
              <Badge className="bg-brand-primary/95 text-white font-sans text-[10px] backdrop-blur-xs border-none font-semibold px-2 py-0.5 shadow-xs">
                Guest Favorite
              </Badge>
            )}
          </div>

          {/* Price Tag (Bottom Right) */}
          <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-xl font-heading font-bold shadow-md z-10 pointer-events-none">
            {formatPrice(listing.pricePerNight)}
            <span className="text-[10px] font-sans font-normal opacity-85">
              {" "}
              / night
            </span>
          </div>

          {/* Image Navigation Controls */}
          {images.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white dark:bg-neutral-900/90 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex items-center justify-center shadow-md sm:opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white dark:bg-neutral-900/90 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex items-center justify-center shadow-md sm:opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-neutral-950/40 backdrop-blur-xs">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentImageIndex
                        ? "w-2.5 h-1.5 bg-white shadow-xs rounded-full"
                        : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              {/* Image Counter Badge (Top Right) */}
              <div className="absolute top-3 right-3 bg-neutral-950/60 backdrop-blur-xs text-white text-[10px] font-sans px-2 py-0.5 rounded-full flex items-center gap-1 z-10 font-medium pointer-events-none">
                <ImageIcon className="w-3 h-3" />
                <span>
                  {currentImageIndex + 1}/{images.length}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-4.5 space-y-3">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1 group-hover:text-brand-primary transition">
              {listing.title}
            </h3>
            <p className="text-xs font-sans text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="truncate">
                {listing.location.city},{" "}
                {listing.location.state || listing.location.country}
              </span>
            </p>
          </div>

          {/* Specs Strip */}
          <div className="flex items-center justify-between text-xs font-sans text-neutral-600 dark:text-neutral-400 py-2 border-y border-neutral-100 dark:border-neutral-800">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-secondary" />
              {listing.specs.maxGuests} Guests
            </span>
            <span className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-brand-secondary" />
              {listing.specs.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-brand-secondary" />
              {listing.specs.bathrooms} Baths
            </span>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center justify-between text-xs font-sans">
            {listing.reviewCount > 0 ? (
              <span className="flex items-center gap-1 font-bold text-neutral-900 dark:text-white">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="font-normal text-neutral-400 text-[11px]">
                  ({listing.reviewCount} reviews)
                </span>
              </span>
            ) : (
              <span className="text-[11px] text-neutral-400">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-4.5 pt-0 grid grid-cols-2 gap-2.5">
        <Link
          href={`/listings/${listing.id}`}
          target="_blank"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-300 transition shadow-2xs active:scale-98"
        >
          <span>Preview Stay</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <Link
          href={`/host?listing=${listing.id}`}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-sans font-semibold hover:opacity-90 transition shadow-2xs active:scale-98"
        >
          <span>View Bookings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
