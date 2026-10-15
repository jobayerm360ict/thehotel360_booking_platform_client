"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Listing } from "@/types";
import { ListingCard } from "./ListingCard";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface SubCategorySliderProps {
  title: string;
  description?: string;
  listings: Listing[];
}

export function SubCategorySlider({
  title,
  description,
  listings,
}: SubCategorySliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (!listings || listings.length === 0) return null;

  return (
    <section className="space-y-3 py-2">
      {/* Header with Title on Left & Slide Arrows on Right */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs font-serif text-neutral-500 mt-0.5 font-light">
              {description}
            </p>
          )}
        </div>

        {/* Swiper Slide Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-primary/60 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-brand-primary dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label={`Slide ${title} left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-primary/60 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-brand-primary dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label={`Slide ${title} right`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swiper Container with proper clipping so cards never overlap */}
      <div className="pt-1 pb-2 overflow-hidden">
        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          speed={400}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            480: {
              slidesPerView: 1.8,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.4,
              spaceBetween: 18,
            },
            768: {
              slidesPerView: 3.2,
              spaceBetween: 18,
            },
            1024: {
              slidesPerView: 4.2,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 7,
              spaceBetween: 20,
            },
          }}
          className="w-full"
        >
          {listings.map((listing) => (
            <SwiperSlide key={listing.id} className="!h-auto">
              <div className="h-full">
                <ListingCard listing={listing} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
