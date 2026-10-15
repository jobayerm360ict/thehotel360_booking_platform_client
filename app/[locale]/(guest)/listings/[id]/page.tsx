"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import { useGetListingByIdQuery } from "@/store/api/listingsApi";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { MobileStickyBookingBar } from "@/components/booking/MobileStickyBookingBar";
import { ListingPhotoGallery } from "@/components/listings/ListingPhotoGallery";
import { ListingDatePicker } from "@/components/listings/ListingDatePicker";
import { ListingReviewsSection } from "@/components/listings/ListingReviewsSection";
import { ListingMapSection } from "@/components/listings/ListingMapSection";
import { ListingHostSection } from "@/components/listings/ListingHostSection";
import { ListingThingsToKnow } from "@/components/listings/ListingThingsToKnow";
import { ListingStickyNav } from "@/components/listings/ListingStickyNav";
import { HotelRoomsSection } from "@/components/hotel/HotelRoomsSection";
import { HotelRoom } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Heart,
  Share2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Award,
  Key,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Wifi,
  Tv,
  Car,
  Utensils,
  Wind,
  Flame,
  Waves,
} from "lucide-react";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  "Infinity pool": Waves,
  "Private swimming pool": Waves,
  "Private jungle plunge pool": Waves,
  "Private hot tub": Flame,
  "Cedar wood-fired hot tub": Flame,
  "Hinoki wood onsen tub": Flame,
  "Fast Wi-Fi (250 Mbps)": Wifi,
  "High-speed Starlink Wi-Fi": Wifi,
  "Gigabit fiber Wi-Fi": Wifi,
  "High speed Wi-Fi": Wifi,
  "Free parking on premises": Car,
  "Air conditioning": Wind,
  "Kitchen with espresso bar": Utensils,
  "Full modern kitchen": Utensils,
  "Sub-Zero chef kitchen": Utensils,
};

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const dispatch = useAppDispatch();
  const allListings = useAppSelector((state) => state.listings.items);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const filter = useAppSelector((state) => state.filter);


  const [copiedShare, setCopiedShare] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string | null>(filter.checkIn || null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(filter.checkOut || null);

  const { data: listing, isLoading, error } = useGetListingByIdQuery(resolvedParams.id);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(() => {
    return listing?.hotelRooms?.[0] || null;
  });

  const handleDatesChange = (start: string | null, end: string | null) => {
    setCheckInDate(start);
    setCheckOutDate(end);
    setSelectedRoom(null);
  };

  if (isLoading) return <div className="p-10 text-center">Loading stay…</div>;
  if (error) return <div className="p-10 text-center">Unable to load this stay. Please retry.</div>;
  if (!listing) {
    return notFound();
  }

  const isFavorite = favoriteIds.includes(listing.id);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const scrollToDatePicker = () => {
    const el = document.getElementById("date-picker-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Floating In-Page Sticky Navigation Bar (Appears smoothly after scrolling down) */}
      <ListingStickyNav
        hasRooms={Boolean(listing.hotelRooms && listing.hotelRooms.length > 0)}
        pricePerNight={listing.pricePerNight}
        rating={listing.rating}
        reviewCount={listing.reviewCount}
        selectedRoomPrice={selectedRoom?.pricePerNight}
        onReserveClick={() => {
          const bookingWidget = document.getElementById(
            "booking-widget-section",
          );
          if (bookingWidget) {
            const navOffset = 135;
            const elementPosition =
              bookingWidget.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: elementPosition - navOffset,
              behavior: "smooth",
            });
          } else {
            scrollToDatePicker();
          }
        }}
      />

      {/* Main Listing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 lg:pb-24">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4 transition-all duration-200 hover:-translate-x-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to all stays</span>
        </Link>

        {/* Title & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down mb-6">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-sm font-serif text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white">
                <Star className="w-4 h-4 fill-brand-primary text-brand-primary" />
                <span className="font-sans font-semibold">
                  {listing.rating.toFixed(2)}
                </span>
                <span className="underline ml-0.5 font-normal text-neutral-500">
                  ({listing.reviewCount} verified reviews)
                </span>
              </div>
              <span>•</span>
              {listing.host.isSuperhost && (
                <>
                  <div className="flex items-center gap-1 text-brand-secondary font-medium">
                    <Award className="w-4 h-4 text-brand-primary" />
                    <span>Superhost Sanctuary</span>
                  </div>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1 underline cursor-pointer text-neutral-600 hover:text-neutral-900 transition-colors">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>
                  {listing.location.city}, {listing.location.country}
                </span>
              </div>
            </div>
          </div>

          {/* Share & Save Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-sans font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? "Link copied!" : "Share"}</span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(toggleFavorite(listing.id))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-sans font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-300 ${
                  isFavorite
                    ? "fill-brand-primary text-brand-primary scale-110"
                    : "text-neutral-700 dark:text-neutral-300 hover:scale-105"
                }`}
              />
              <span>{isFavorite ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        {/* Listing Photo Gallery (Desktop collage + Mobile slider + Lightbox) */}
        <div id="photos-section" className="scroll-mt-36">
          <ListingPhotoGallery images={listing.images} title={listing.title} />
        </div>

        {/* Content Layout Grid (Main info left + Sticky booking widget right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* About & Amenities Section */}
            <div id="about-section" className="scroll-mt-36 space-y-6">
              {/* Hosted By Header */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-neutral-900 dark:text-white">
                    Entire {listing.specs.propertyType} hosted by{" "}
                    {listing.host.name}
                  </h2>
                  <p className="text-sm font-serif text-neutral-500 mt-1">
                    {listing.specs.maxGuests} guests · {listing.specs.bedrooms}{" "}
                    bedrooms · {listing.specs.beds} beds ·{" "}
                    {listing.specs.bathrooms} baths
                  </p>
                </div>

                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-primary/20 shadow-md">
                  <Image
                    src={listing.host.avatar}
                    alt={listing.host.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Guest Favorite / Key Highlights */}
              <div className="space-y-5 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                {listing.isGuestFavorite && (
                  <div className="flex items-start gap-4">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
                        Guest favorite
                      </h3>
                      <p className="text-sm text-neutral-500 font-serif">
                        One of the most loved homes on Travistay, based on
                        ratings, reviews, and reliability.
                      </p>
                    </div>
                  </div>
                )}

                {listing.host.isSuperhost && (
                  <div className="flex items-start gap-4">
                    <Award className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
                        {listing.host.name} is a Superhost
                      </h3>
                      <p className="text-sm text-neutral-500 font-serif">
                        Superhosts are experienced, highly rated hosts who are
                        committed to providing great stays.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Key className="w-5 h-5 text-neutral-800 dark:text-white shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
                      Seamless self check-in
                    </h3>
                    <p className="text-sm text-neutral-500 font-serif">
                      Check yourself in with the smart keypad upon arrival.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-neutral-800 dark:text-white shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
                      Flexible cancellation
                    </h3>
                    <p className="text-sm text-neutral-500 font-serif">
                      {listing.cancellationPolicy}
                    </p>
                  </div>
                </div>
              </div>

              {/* About this space */}
              <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
                <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
                  About this sanctuary
                </h3>
                <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif">
                  {listing.description}
                </p>
                <p className="text-sm font-serif italic text-brand-primary">
                  &ldquo;{listing.tagline}&rdquo;
                </p>
              </div>

              {/* What this place offers / Amenities */}
              <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
                  What this sanctuary offers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.amenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity] || CheckCircle2;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 text-sm font-serif text-neutral-800 dark:text-neutral-200"
                      >
                        <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hotel Rooms & Suites Section (Only Rendered for Hotels) */}
            {listing.hotelRooms && listing.hotelRooms.length > 0 && (
              <div id="hotel-rooms-section" className="scroll-mt-36">
                <HotelRoomsSection
                  listing={listing}
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  selectedRoomId={selectedRoom?.id || null}
                  onSelectRoom={(room) => setSelectedRoom(room)}
                  onOpenDatePicker={scrollToDatePicker}
                />
              </div>
            )}

            {/* Interactive Date Picker (Screenshot 1) */}
            <div id="date-picker-section" className="scroll-mt-36">
              <ListingDatePicker
                city={listing.location.city}
                startDate={checkInDate}
                endDate={checkOutDate}
                datesAvailable={listing.datesAvailable}
                onDatesChange={handleDatesChange}
              />
            </div>

            {/* Guest Reviews Section with Mentions & All Reviews Modal (Screenshot 2) */}
            <div id="reviews-section" className="scroll-mt-36">
              <ListingReviewsSection
                rating={listing.rating}
                reviews={listing.reviews}
              />
            </div>

            {/* Where you'll be: Location & Interactive Map (Screenshot 3) */}
            <div id="map-section" className="scroll-mt-36">
              <ListingMapSection
                location={listing.location}
                listingTitle={listing.title}
                pricePerNight={listing.pricePerNight}
                imageThumbnail={listing.images[0]}
              />
            </div>

            {/* Meet your host & Message Host (Screenshot 4) */}
            <ListingHostSection listingId={listing.id}
              host={listing.host}
              rating={listing.rating}
              reviewCount={listing.reviewCount}
            />
          </div>

          {/* Right Column: Sticky Booking Widget (Synced with DatePicker and Selected Room) */}
          <div
            id="booking-widget-section"
            className="lg:col-span-1 scroll-mt-36"
          >
            <BookingWidget
              listing={listing}
              startDate={checkInDate}
              endDate={checkOutDate}
              onDatesChange={handleDatesChange}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
            />
          </div>
        </div>

        {/* Things to know (Screenshot 4) - Full Width Section */}
        <ListingThingsToKnow
          cancellationPolicy={listing.cancellationPolicy}
          rules={listing.rules}
          maxGuests={listing.specs.maxGuests}
        />

        {/* Mobile Sticky Booking Bar (Confirm and Reserve) */}
        <MobileStickyBookingBar
          listing={listing}
          startDate={checkInDate}
          endDate={checkOutDate}
          selectedRoomId={selectedRoom?.id}
          onScrollToDatePicker={scrollToDatePicker}
        />
      </div>
    </div>
  );
}
