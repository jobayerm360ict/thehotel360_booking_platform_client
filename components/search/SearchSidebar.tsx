"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/lib/utils";
import {
  MAX_STAY_PRICE_BDT,
  setPriceRange,
  togglePropertyType,
  toggleAmenity,
  setSuperhostOnly,
  setGuestFavoriteOnly,
  resetFilters,
} from "@/store/slices/filterSlice";
import {
  Wind,
  Zap,
  Bath,
  Wifi,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  Building2,
  Home,
  Sparkles,
  TreePine,
  Check,
  Waves,
  Car,
  Coffee,
  Laptop,
  X,
} from "lucide-react";

interface SearchSidebarProps {
  filteredCount: number;
  totalCount: number;
  onCloseMobile?: () => void;
}

export function SearchSidebar({
  filteredCount,
  totalCount,
  onCloseMobile,
}: SearchSidebarProps) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(true);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Quick pick items (2x2 grid for generous width and readability)
  const QUICK_PICKS = [
    {
      id: "Air conditioning",
      label: "Air Conditioning",
      icon: Wind,
      amenity: "Air conditioning",
    },
    {
      id: "guest-fav",
      label: "Guest Favorite",
      icon: Zap,
      isGuestFav: true,
    },
    {
      id: "Private hot tub",
      label: "Private Hot Tub",
      icon: Bath,
      amenity: "Private hot tub",
    },
    {
      id: "Fast Wi-Fi (250 Mbps)",
      label: "Fast Wi-Fi",
      icon: Wifi,
      amenity: "Fast Wi-Fi (250 Mbps)",
    },
  ];

  // Property types with icons
  const PLACE_TYPES = [
    { id: "all", label: "All Types", icon: Sparkles },
    { id: "apartment", label: "Apartment", icon: Building2 },
    { id: "house", label: "Private Room", icon: Home },
    { id: "villa", label: "Luxury Villa", icon: Sparkles },
    { id: "cabin", label: "Cabin", icon: TreePine },
  ];

  // All amenities with icons
  const ALL_AMENITIES = [
    { id: "Air conditioning", label: "Air Conditioning", icon: Wind },
    { id: "Fast Wi-Fi (250 Mbps)", label: "Fast Wi-Fi (250 Mbps)", icon: Wifi },
    { id: "Dedicated workspace", label: "Dedicated Workspace", icon: Laptop },
    { id: "Private hot tub", label: "Private Hot Tub", icon: Bath },
    { id: "Infinity pool", label: "Infinity Pool", icon: Waves },
    {
      id: "Kitchen with espresso bar",
      label: "Kitchen & Espresso Bar",
      icon: Coffee,
    },
    { id: "Free parking on premises", label: "Free Parking", icon: Car },
    { id: "Attached private washroom", label: "Attached Bath", icon: Bath },
    {
      id: "Balcony with open view",
      label: "Open View Balcony",
      icon: TreePine,
    },
    { id: "Generator backup", label: "24/7 Power Backup", icon: Zap },
  ];

  const minPrice = filter.priceRange[0];
  const maxPrice = filter.priceRange[1];

  const handleMinPriceChange = (val: number) => {
    const clamped = Math.min(Math.max(0, val), maxPrice - 500);
    dispatch(setPriceRange([clamped, maxPrice]));
  };

  const handleMaxPriceChange = (val: number) => {
    const clamped = Math.max(val, minPrice + 500);
    dispatch(setPriceRange([minPrice, clamped]));
  };

  // Active filter count calculation
  const activeFilterCount =
    filter.propertyTypes.length +
    filter.amenities.length +
    (filter.superhostOnly ? 1 : 0) +
    (filter.guestFavoriteOnly ? 1 : 0) +
    (filter.priceRange[0] > 0 || filter.priceRange[1] < MAX_STAY_PRICE_BDT ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;
  const visibleAmenities = showAllAmenities
    ? ALL_AMENITIES
    : ALL_AMENITIES.slice(0, 6);

  return (
    <aside className="w-full h-full max-h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm flex flex-col overflow-hidden transition-all duration-300">
      {/* 1. Fixed Header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                Filters
              </h2>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-sans font-bold bg-brand-primary text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-sans font-semibold text-brand-primary dark:text-rose-300 transition-all cursor-pointer active:scale-95"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-pointer transition active:scale-95"
              title="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Scrollable Body (Internal Scroll with sleek scrollbar) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar overscroll-contain">
        {/* Section: Quick Picks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Popular Highlights
            </h3>
            <span className="text-[10px] text-brand-primary font-sans font-semibold">
              Instant
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_PICKS.map((item) => {
              const Icon = item.icon;
              const isSelected = item.isGuestFav
                ? filter.guestFavoriteOnly
                : filter.amenities.includes(item.amenity || item.id);

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    if (item.isGuestFav) {
                      dispatch(setGuestFavoriteOnly(!filter.guestFavoriteOnly));
                    } else if (item.amenity) {
                      dispatch(toggleAmenity(item.amenity));
                    }
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary font-semibold ring-1 ring-brand-primary/30"
                      : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-brand-primary text-white"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-2xs"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-sans leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Type of Place */}
        <div className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
          <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Property Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PLACE_TYPES.map((type) => {
              const isSelected =
                type.id === "all"
                  ? filter.propertyTypes.length === 0
                  : filter.propertyTypes.includes(type.id);
              const Icon = type.icon;

              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => {
                    if (type.id === "all") {
                      filter.propertyTypes.forEach((t) =>
                        dispatch(togglePropertyType(t)),
                      );
                    } else {
                      dispatch(togglePropertyType(type.id));
                    }
                  }}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-2xl text-xs font-sans font-medium transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm font-semibold"
                      : "border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 bg-white dark:bg-neutral-800/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{type.label}</span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Price Range */}
        <div className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Nightly Price
              </h3>
              <p className="text-[11px] font-serif text-neutral-400">
                Before service fees and taxes
              </p>
            </div>
            <span className="text-xs font-sans font-bold text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 px-2.5 py-1 rounded-full">
              {formatPrice(minPrice)} – {formatPrice(maxPrice)}
            </span>
          </div>

          <div className="pt-2 px-1">
            {/* Dual Range Sliders */}
            <div className="relative mt-2 mb-3">
              <input
                type="range"
                min={0}
                max={MAX_STAY_PRICE_BDT}
                step={500}
                value={minPrice}
                onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                className="absolute pointer-events-none w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white dark:[&::-webkit-slider-thumb]:ring-neutral-900 shadow-sm"
              />
              <input
                type="range"
                min={0}
                max={MAX_STAY_PRICE_BDT}
                step={500}
                value={maxPrice}
                onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                className="absolute pointer-events-none w-full h-1.5 bg-transparent appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white dark:[&::-webkit-slider-thumb]:ring-neutral-900 shadow-sm"
              />
            </div>
          </div>

          {/* Min & Max Inputs with Dollar styling */}
          <div className="grid grid-cols-2 gap-2.5 items-center pt-1">
            <div className="border border-neutral-200/90 dark:border-neutral-700/80 rounded-2xl p-2.5 bg-neutral-50/70 dark:bg-neutral-800/60 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-neutral-400 block">
                Minimum
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-neutral-500">BDT</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                  className="w-full text-xs font-sans font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-neutral-200/90 dark:border-neutral-700/80 rounded-2xl p-2.5 bg-neutral-50/70 dark:bg-neutral-800/60 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-neutral-400 block">
                Maximum
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-neutral-500">BDT</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                  className="w-full text-xs font-sans font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Verified Tiers (Guest Favorite & Superhost) */}
        <div className="space-y-2.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
          <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Host & Sanctuary Badges
          </h3>

          <label
            className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200 ${
              filter.guestFavoriteOnly
                ? "border-amber-400/80 bg-amber-50/60 dark:bg-amber-950/20 text-neutral-900 dark:text-white font-semibold"
                : "border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
              </div>
              <div>
                <span className="text-xs font-sans block font-semibold leading-tight">
                  Guest Favorites
                </span>
                <span className="text-[10px] text-neutral-400 font-serif block">
                  Top 5% rated by guests
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={filter.guestFavoriteOnly}
              onChange={(e) => dispatch(setGuestFavoriteOnly(e.target.checked))}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </label>

          <label
            className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200 ${
              filter.superhostOnly
                ? "border-emerald-400/80 bg-emerald-50/60 dark:bg-emerald-950/20 text-neutral-900 dark:text-white font-semibold"
                : "border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-sans block font-semibold leading-tight">
                  Superhost Managed
                </span>
                <span className="text-[10px] text-neutral-400 font-serif block">
                  Experienced, top hosts
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={filter.superhostOnly}
              onChange={(e) => dispatch(setSuperhostOnly(e.target.checked))}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Section: Curated Amenities */}
        <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
            className="w-full flex items-center justify-between font-heading font-semibold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <div className="flex items-center gap-1.5">
              <span>Amenities & Facilities</span>
              {filter.amenities.length > 0 && (
                <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-1.5 py-0.2 rounded-full">
                  {filter.amenities.length}
                </span>
              )}
            </div>
            {isAmenitiesOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isAmenitiesOpen && (
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visibleAmenities.map((item) => {
                  const isChecked = filter.amenities.includes(item.id);
                  const Icon = item.icon;

                  return (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-sans transition border ${
                        isChecked
                          ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary dark:text-rose-300 font-semibold shadow-2xs"
                          : "border-neutral-200/70 dark:border-neutral-800/80 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <Icon className="w-3.5 h-3.5 opacity-70 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => dispatch(toggleAmenity(item.id))}
                        className="w-3.5 h-3.5 accent-[#1a73e8] rounded cursor-pointer shrink-0"
                      />
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="w-full text-center py-2 text-xs font-sans font-semibold text-brand-primary hover:underline cursor-pointer pt-1"
              >
                {showAllAmenities
                  ? "Show Less Amenities"
                  : `+ Show ${ALL_AMENITIES.length - 6} More Amenities`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Fixed Footer Count / Action */}
      <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-sm shrink-0 flex items-center justify-between gap-3">
        <div className="text-xs font-sans">
          <span className="font-bold text-neutral-900 dark:text-white">
            {filteredCount}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">
            {" "}
            of {totalCount} Stays
          </span>
        </div>

        {onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="px-4 py-2 rounded-full bg-brand-primary text-white text-xs font-sans font-semibold shadow-sm hover:bg-brand-primary-hover transition cursor-pointer"
          >
            Show {filteredCount} Results
          </button>
        ) : (
          hasActiveFilters && (
            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="text-[11px] font-sans font-semibold text-neutral-500 hover:text-brand-primary transition cursor-pointer"
            >
              Clear all
            </button>
          )
        )}
      </div>
    </aside>
  );
}
