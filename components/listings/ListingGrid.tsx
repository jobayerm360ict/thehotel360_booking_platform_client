"use client";

import { usePlatformSearch } from "@/hooks/usePlatformSearch";
import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ListingCard } from "./ListingCard";
import { resetFilters } from "@/store/slices/filterSlice";
import { Sparkles, RotateCcw } from "lucide-react";

export function ListingGrid() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);
  const { listings: allListings, loading, error, retry } = usePlatformSearch(filter);

  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Category filter
      if (filter.category !== "all" && listing.category !== filter.category) {
        return false;
      }

      // Location search
      if (filter.location) {
        const query = filter.location.toLowerCase();
        const matchesLocation =
          listing.location.city.toLowerCase().includes(query) ||
          listing.location.country.toLowerCase().includes(query) ||
          (listing.location.state &&
            listing.location.state.toLowerCase().includes(query)) ||
          listing.title.toLowerCase().includes(query);
        if (!matchesLocation) return false;
      }

      // Search Query
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchesQ =
          listing.title.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q) ||
          listing.location.city.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      // Price range
      if (
        listing.pricePerNight < filter.priceRange[0] ||
        listing.pricePerNight > filter.priceRange[1]
      ) {
        return false;
      }

      // Property type
      if (
        filter.propertyTypes.length > 0 &&
        !filter.propertyTypes.includes(listing.specs.propertyType)
      ) {
        return false;
      }

      // Superhost only
      if (filter.superhostOnly && !listing.host.isSuperhost) {
        return false;
      }

      // Guest favorite only
      if (filter.guestFavoriteOnly && !listing.isGuestFavorite) {
        return false;
      }

      // Amenities filter
      if (
        filter.amenities.length > 0 &&
        !filter.amenities.every((amenity) =>
          listing.amenities.includes(amenity),
        )
      ) {
        return false;
      }

      return true;
    });
  }, [allListings, filter]);

  if (loading) return <div role="status" className="py-24 text-center">Loading stays…</div>;
  if (error) return <div role="alert" className="py-24 text-center">{error}<button type="button" className="ml-3 underline" onClick={retry}>Retry</button></div>;

  if (filteredListings.length === 0) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center max-w-lg mx-auto bg-white animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary mb-5 animate-bounce"></div>
        <h3 className="font-heading text-2xl font-semibold text-brand-primary dark:text-white">
          No Sanctuaries Found
        </h3>
        <p className="text-sm text-brand-primary/80 mt-2 mb-8 leading-relaxed font-light">
          We couldn&apos;t find properties matching your exact criteria. Try
          widening your price filter or selecting another region.
        </p>
        <button
          type="button"
          onClick={() => dispatch(resetFilters())}
          className="flex items-center gap-2 cursor-pointer px-6 py-3 rounded-full border border-brand-primary dark:border-white text-xs font-sans font-semibold text-brand-primary dark:text-white hover:bg-brand-primary hover:text-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-3 gap-y-10 py-8 animate-fade-in">
      {filteredListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
