"use client";

import React, { useRef } from "react";
import { CATEGORIES } from "@/data/categories";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCategory } from "@/store/slices/filterSlice";
import { setFilterModalOpen } from "@/store/slices/uiSlice";
import {
  Flame,
  Palmtree,
  TreePine,
  Castle,
  Mountain,
  Sparkles,
  TreeDeciduous,
  Waves,
  Home,
  Tractor,
  Gem,
  Sun,
  Snowflake,
  Compass,
  Ship,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Palmtree,
  TreePine,
  Castle,
  Mountain,
  Sparkles,
  TreeDeciduous,
  Waves,
  Home,
  Tractor,
  Gem,
  Sun,
  Snowflake,
  Compass,
  Ship,
};

export function CategoryBar() {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector((state) => state.filter.category);
  const filter = useAppSelector((state) => state.filter);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const activeFilterCount = [
    Boolean(filter.location),
    Boolean(filter.checkIn),
    filter.guests.adults > 1 || filter.guests.children > 0,
    filter.propertyTypes.length > 0,
    filter.amenities.length > 0,
    filter.superhostOnly,
    filter.guestFavoriteOnly,
  ].filter(Boolean).length;

  return (
    <div className="sticky top-20 z-30 bg-white dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="hidden md:flex w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 items-center justify-center text-neutral-600 dark:text-neutral-300 hover:scale-110 hover:-translate-x-0.5 active:scale-90 hover:shadow-md transition-all duration-200 shrink-0 bg-white dark:bg-neutral-900 cursor-pointer"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Category List */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Flame;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => dispatch(setCategory(cat.id))}
                className={cn(
                  "flex flex-col items-center gap-2 pb-2 cursor-pointer transition-all duration-300 shrink-0 border-b-2 font-serif text-sm group select-none hover:-translate-y-0.5 active:scale-95",
                  isSelected
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                    isSelected &&
                      "scale-110 text-brand-primary bg-brand-primary-light dark:bg-neutral-800",
                  )}
                >
                  <IconComponent className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="whitespace-nowrap font-bold text-[13px] tracking-wide">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden md:flex w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 items-center justify-center text-neutral-600 dark:text-neutral-300 hover:scale-110 hover:translate-x-0.5 active:scale-90 hover:shadow-md transition-all duration-200 shrink-0 bg-white dark:bg-neutral-900 cursor-pointer"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => dispatch(setFilterModalOpen(true))}
          className="hidden sm:flex items-center gap-2.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl px-5 py-2.5 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 hover:border-brand-primary hover:text-brand-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shrink-0 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
