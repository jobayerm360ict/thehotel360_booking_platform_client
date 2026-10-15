"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setPriceRange,
  togglePropertyType,
  toggleAmenity,
  setSuperhostOnly,
  setGuestFavoriteOnly,
  resetFilters,
} from "@/store/slices/filterSlice";
import { setFilterModalOpen } from "@/store/slices/uiSlice";
import { formatPrice } from "@/lib/utils";
import {
  Home,
  Building2,
  Palmtree,
  Trees,
  Castle,
  Sparkles,
  Check,
  Award,
  Medal,
} from "lucide-react";

const PROPERTY_TYPES = [
  { id: "house", label: "House", icon: Home },
  { id: "apartment", label: "Apartment", icon: Building2 },
  { id: "villa", label: "Villa", icon: Palmtree },
  { id: "cabin", label: "Cabin", icon: Trees },
  { id: "mansion", label: "Mansion", icon: Castle },
  { id: "treehouse", label: "Treehouse", icon: Sparkles },
];

const AMENITY_OPTIONS = [
  "Infinity pool",
  "Private hot tub",
  "Fast Wi-Fi (250 Mbps)",
  "Dedicated workspace",
  "Kitchen with espresso bar",
  "Air conditioning",
  "Balcony with sea view",
  "Free parking on premises",
  "Cedar wood-fired hot tub",
  "Indoor fireplace",
  "Kayaks & life vests included",
  "Private swimming pool",
  "Wine tasting cellar",
  "Private chef available",
];

export function FilterModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isFilterModalOpen);
  const filter = useAppSelector((state) => state.filter);
  const listings = useAppSelector((state) => state.listings.items);

  // Count filtered listings
  const filteredCount = listings.filter((l) => {
    if (
      l.pricePerNight < filter.priceRange[0] ||
      l.pricePerNight > filter.priceRange[1]
    )
      return false;
    if (
      filter.propertyTypes.length > 0 &&
      !filter.propertyTypes.includes(l.specs.propertyType)
    )
      return false;
    if (filter.superhostOnly && !l.host.isSuperhost) return false;
    if (filter.guestFavoriteOnly && !l.isGuestFavorite) return false;
    if (
      filter.amenities.length > 0 &&
      !filter.amenities.every((a) => l.amenities.includes(a))
    )
      return false;
    return true;
  }).length;

  const hasActiveFilters =
    filter.priceRange[0] > 0 ||
    filter.priceRange[1] < 2000 ||
    filter.propertyTypes.length > 0 ||
    filter.amenities.length > 0 ||
    filter.superhostOnly ||
    filter.guestFavoriteOnly;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => dispatch(setFilterModalOpen(open))}
    >
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl rounded-3xl"
        onClose={() => dispatch(setFilterModalOpen(false))}
      >
        {/* Modal Header */}
        <DialogHeader className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-center">
          <DialogTitle className="text-lg font-heading font-bold text-neutral-900 dark:text-white">
            Filter Sanctuaries
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-7 divide-y divide-neutral-100 dark:divide-neutral-800">
          {/* 1. Price Range */}
          <div className="space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-neutral-900 dark:text-white text-base">
                Price range per night
              </h4>
              <p className="text-xs font-serif text-neutral-500">
                Nightly prices before applicable taxes and sanctuary fees
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="2000"
                step="25"
                value={filter.priceRange[1]}
                onChange={(e) =>
                  dispatch(
                    setPriceRange([filter.priceRange[0], Number(e.target.value)])
                  )
                }
                className="w-full accent-brand-primary cursor-pointer"
              />

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="text-[10px] font-sans uppercase font-semibold text-neutral-400 block">
                    Minimum
                  </span>
                  <span className="text-sm font-sans font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(filter.priceRange[0])}
                  </span>
                </div>

                <span className="text-neutral-400 font-serif">—</span>

                <div className="flex-1 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="text-[10px] font-sans uppercase font-semibold text-neutral-400 block">
                    Maximum
                  </span>
                  <span className="text-sm font-sans font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(filter.priceRange[1])}
                    {filter.priceRange[1] >= 2000 ? "+" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Property Type */}
          <div className="pt-6 space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-neutral-900 dark:text-white text-base">
                Property Type
              </h4>
              <p className="text-xs font-serif text-neutral-500">
                Filter by architectural style and dwelling type
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = filter.propertyTypes.includes(type.id);
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => dispatch(togglePropertyType(type.id))}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary-light text-brand-primary ring-2 ring-brand-primary/20 shadow-xs"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-heading font-semibold">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Standout Stays & Host Verification */}
          <div className="pt-6 space-y-3">
            <div>
              <h4 className="font-heading font-semibold text-neutral-900 dark:text-white text-base">
                Standout Stays
              </h4>
              <p className="text-xs font-serif text-neutral-500">
                Curated collections of verified hosts & guest loved properties
              </p>
            </div>

            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  filter.guestFavoriteOnly
                    ? "border-brand-primary bg-brand-primary-light"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-semibold text-neutral-900 dark:text-white">
                      Guest Favorites
                    </p>
                    <p className="text-[11px] font-serif text-neutral-500">
                      The most loved homes on Travistay according to guests
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filter.guestFavoriteOnly}
                  onChange={(e) =>
                    dispatch(setGuestFavoriteOnly(e.target.checked))
                  }
                  className="w-4 h-4 accent-brand-primary cursor-pointer"
                />
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  filter.superhostOnly
                    ? "border-brand-primary bg-brand-primary-light"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Medal className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-semibold text-neutral-900 dark:text-white">
                      Superhosts Only
                    </p>
                    <p className="text-[11px] font-serif text-neutral-500">
                      Stay with experienced hosts with exemplary ratings
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filter.superhostOnly}
                  onChange={(e) =>
                    dispatch(setSuperhostOnly(e.target.checked))
                  }
                  className="w-4 h-4 accent-brand-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 4. Amenities */}
          <div className="pt-6 space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-neutral-900 dark:text-white text-base">
                Amenities & Features
              </h4>
              <p className="text-xs font-serif text-neutral-500">
                Handpicked luxuries for extraordinary stays
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = filter.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => dispatch(toggleAmenity(amenity))}
                    className={`p-3 rounded-2xl border text-left text-xs font-sans transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary-light text-brand-primary font-semibold"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => dispatch(resetFilters())}
            disabled={!hasActiveFilters}
            className={`text-xs font-sans font-semibold underline px-3 py-2 transition ${
              hasActiveFilters
                ? "text-neutral-600 dark:text-neutral-300 hover:text-brand-primary cursor-pointer"
                : "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
            }`}
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={() => dispatch(setFilterModalOpen(false))}
            className="px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Show {filteredCount} {filteredCount === 1 ? "Sanctuary" : "Sanctuaries"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
