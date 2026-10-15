"use client";

import { usePlatformSearch } from "@/hooks/usePlatformSearch";
import { MAX_STAY_PRICE_BDT } from "@/store/slices/filterSlice";
import { formatPrice } from "@/lib/utils";
import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLocation,
  resetFilters,
  togglePropertyType,
  toggleAmenity,
  setCategory,
  setIsNearMeActive,
  setUserLocation,
} from "@/store/slices/filterSlice";
import { calculateDistanceKm } from "@/lib/geolocation";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchSidebar } from "@/components/search/SearchSidebar";
import { SearchPagination } from "@/components/search/SearchPagination";
import { SearchMapWrapper } from "@/components/search/SearchMapWrapper";
import { MapBounds } from "@/components/search/SearchMap";
import { useGetHotelsByMapQuery } from "@/store/api/listingsApi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CATEGORIES } from "@/data/categories";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  RotateCcw,
  MapPin,
  X,
  Compass,
  Building2,
  Flame,
  Palmtree,
  TreePine,
  Castle,
  Mountain,
  Waves,
  Home,
  Check,
  Calendar1,
  Map as MapIcon,
  LayoutGrid,
  Star,
  LocateFixed,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const ITEMS_PER_PAGE = 24;

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Palmtree,
  TreePine,
  Castle,
  Mountain,
  Sparkles,
  Waves,
  Home,
};

function SearchContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = useAppSelector((state) => state.filter);
  const { listings: allListings, loading: searchLoading, error: searchError, retry: retrySearch } = usePlatformSearch(filter);

  // Near me state from search params or Redux
  const isNearMe =
    searchParams.get("nearMe") === "true" || Boolean(filter.isNearMeActive);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const locParam = searchParams.get("location");

  const validLat = useMemo(() => {
    if (!latParam) return null;
    const n = parseFloat(latParam);
    return isNaN(n) ? null : n;
  }, [latParam]);

  const validLng = useMemo(() => {
    if (!lngParam) return null;
    const n = parseFloat(lngParam);
    return isNaN(n) ? null : n;
  }, [lngParam]);

  const userCoords = useMemo(() => {
    if (validLat !== null && validLng !== null) {
      return { lat: validLat, lng: validLng };
    }
    if (filter.userLocation) {
      return filter.userLocation;
    }
    return null;
  }, [validLat, validLng, filter.userLocation]);

  // Sync URL query param `location` if present
  useEffect(() => {
    if (locParam && locParam !== filter.location) {
      dispatch(setLocation(locParam));
    }
  }, [locParam, filter.location, dispatch]);

  // Sync Near me state to Redux only once if not already active
  useEffect(() => {
    if (isNearMe && validLat !== null && validLng !== null) {
      const alreadySynced =
        filter.isNearMeActive &&
        filter.userLocation?.lat === validLat &&
        filter.userLocation?.lng === validLng;
      if (!alreadySynced) {
        dispatch(setIsNearMeActive(true));
        dispatch(setUserLocation({ lat: validLat, lng: validLng }));
      }
    }
  }, [
    isNearMe,
    validLat,
    validLng,
    filter.isNearMeActive,
    filter.userLocation?.lat,
    filter.userLocation?.lng,
    dispatch,
  ]);

  // Real-time distance mapping for all listings from user's GPS coords
  const listingDistances = useMemo(() => {
    const map: Record<string, number> = {};
    if (!userCoords) return map;
    for (const item of allListings) {
      const itemLat = item.location.latitude;
      const itemLng = item.location.longitude;
      if (typeof itemLat === "number" && typeof itemLng === "number") {
        map[item.id] = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          itemLat,
          itemLng
        );
      }
    }
    return map;
  }, [allListings, userCoords]);

  // Page state: default to distance sorting when Near me is active
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>(() =>
    searchParams.get("nearMe") === "true" || filter.isNearMeActive
      ? "distance"
      : "recommended"
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Map View & Interactivity state (Enabled by default to fill the right area)
  const [isMapViewOpen, setIsMapViewOpen] = useState(true);
  const [searchOnMove, setSearchOnMove] = useState(true);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );

  // RTK Query: GET /hotels/map?south&west&north&east&zoom
  const {
    data: mapListingsData,
    isFetching: isMapFetching,
    isLoading: isMapLoading,
    isError: isMapError,
    refetch: refetchMap,
  } = useGetHotelsByMapQuery(
    mapBounds || {
      south: 23.7,
      west: 90.3,
      north: 23.9,
      east: 90.5,
      zoom: 12,
    },
    {
      skip: !isMapViewOpen || !mapBounds,
    },
  );

  // Filter listings based on sidebar filter criteria
  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Category filter
      if (filter.category !== "all" && listing.category !== filter.category) {
        return false;
      }

      // Location search (bypassed if Near Me is active so closest listings can rank)
      if (filter.location && !isNearMe) {
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

  // Search availability and filters come from the backend result set. The map only narrows its bounds.
  const baseActiveListings = useMemo(() => {
    if (isMapViewOpen && mapListingsData) {
      const availableIds = new Set(filteredListings.map((listing) => listing.id));
      return mapListingsData.filter((listing) => availableIds.has(listing.id));
    }
    return filteredListings;
  }, [isMapViewOpen, mapListingsData, filteredListings]);
  // Sort listings
  const sortedListings = useMemo(() => {
    const list = [...baseActiveListings];
    if (sortBy === "distance" && userCoords) {
      list.sort((a, b) => {
        const distA = listingDistances[a.id] ?? Infinity;
        const distB = listingDistances[b.id] ?? Infinity;
        return distA - distB;
      });
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (isNearMe && userCoords) {
      list.sort((a, b) => {
        const distA = listingDistances[a.id] ?? Infinity;
        const distB = listingDistances[b.id] ?? Infinity;
        return distA - distB;
      });
    }
    return list;
  }, [baseActiveListings, sortBy, userCoords, isNearMe, listingDistances]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedListings.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedListings.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedListings, currentPage]);

  const listingsContainerRef = useRef<HTMLDivElement>(null);

  // Handle page change with smooth scroll to top of listings
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      listingsContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset page to 1 when filters change (only if not already on page 1)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset pagination when availability filters change.
    setCurrentPage((prev) => (prev !== 1 ? 1 : prev));
  }, [
    filter.category,
    filter.location,
    filter.checkIn,
    filter.checkOut,
    filter.priceRange,
    filter.propertyTypes,
    filter.amenities,
    filter.superhostOnly,
    filter.guestFavoriteOnly,
    filter.searchQuery,
    sortBy,
  ]);

  const hasActiveFilters = Boolean(
    (filter.category && filter.category !== "all") ||
    filter.location ||
    filter.searchQuery ||
    filter.propertyTypes.length > 0 ||
    filter.amenities.length > 0 ||
    filter.superhostOnly ||
    filter.guestFavoriteOnly ||
    filter.priceRange[0] > 0 ||
    filter.priceRange[1] < MAX_STAY_PRICE_BDT,
  );

  const selectedListing = useMemo(() => {
    if (!selectedListingId) return null;
    return sortedListings.find((l) => l.id === selectedListingId) || null;
  }, [sortedListings, selectedListingId]);

  return (
    <div
      className={`${
        isMapViewOpen
          ? "h-[calc(100dvh-12.3rem)] md:h-[calc(100vh-5rem)] max-h-[calc(100dvh-12.3rem)] md:max-h-[calc(100vh-5rem)] overflow-hidden"
          : "min-h-screen lg:h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-5rem)] overflow-visible lg:overflow-hidden"
      } flex flex-col bg-[#fcfbf9] dark:bg-neutral-950 relative`}
    >
      {/* 1. Compact Top Bar: Breadcrumb/Count & Action Controls */}
      <div
        className={`${
          isMapViewOpen ? "shrink-0 z-30" : "static lg:shrink-0 lg:z-30"
        } bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2`}
      >
        {/* Left: Location & Stays Count */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {isNearMe ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary min-w-0">
              <LocateFixed className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-[200px]">
                {filter.location || "Near me"}
              </span>
              <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary">
                Near me
              </span>
            </div>
          ) : filter.location ? (
            <div className="flex items-center gap-1 text-xs font-semibold text-brand-primary min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-[200px]">
                {filter.location}
              </span>
            </div>
          ) : (
            <h1 className="font-heading font-bold text-xs sm:text-base text-neutral-900 dark:text-white truncate">
              Sanctuaries
            </h1>
          )}
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] sm:text-[11px] font-semibold shrink-0">
            {sortedListings.length}
          </span>
        </div>

        {/* Right Controls: Filters, Sort & Map Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[11px]">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            )}
          </button>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[105px] sm:w-[155px] h-8 text-[11px] sm:text-xs rounded-xl bg-white dark:bg-neutral-800 border-neutral-200/90 dark:border-neutral-700">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent align="end" className="z-50">
              <SelectItem value="recommended">Recommended</SelectItem>
              {userCoords && (
                <SelectItem value="distance">Nearest to Me (GPS)</SelectItem>
              )}
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* Map View Toggle Button (Accessible on both Mobile & Desktop) */}
          <button
            type="button"
            onClick={() => {
              setIsMapViewOpen(!isMapViewOpen);
              if (!isMapViewOpen && typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "instant" });
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-sans font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
              isMapViewOpen
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
            }`}
          >
            {isMapViewOpen ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-brand-primary" />
                <span>List</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5 text-brand-primary" />
                <span>Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Quick Category Horizontal Scroll Bar */}
      <div
        className={`${
          isMapViewOpen ? "shrink-0" : "static lg:shrink-0"
        } px-3 sm:px-6 lg:px-8 py-1.5 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar`}
      >
        <button
          type="button"
          onClick={() => dispatch(setCategory("all"))}
          className={`px-3 py-1 rounded-xl text-xs font-sans font-semibold transition-all duration-200 shrink-0 cursor-pointer border ${
            filter.category === "all"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs"
              : "bg-white dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-700 hover:border-neutral-400"
          }`}
        >
          All
        </button>
        {CATEGORIES.slice(0, 10).map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          const isSelected = filter.category === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => dispatch(setCategory(cat.id))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-sans font-semibold transition-all duration-200 shrink-0 cursor-pointer border ${
                isSelected
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-white dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-700 hover:border-neutral-400"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Slim Active Filters Bar */}
      {hasActiveFilters && (
        <div className="static lg:shrink-0 px-3 sm:px-6 lg:px-8 py-1.5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-neutral-400 font-sans font-medium text-[11px] shrink-0">
            Filters:
          </span>

          {filter.location && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-[11px] shrink-0">
              <span>Location: {filter.location}</span>
              <button
                type="button"
                onClick={() => dispatch(setLocation(""))}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.category !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] shrink-0">
              <span>Category: {filter.category}</span>
              <button
                type="button"
                onClick={() => dispatch(setCategory("all"))}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.propertyTypes.map((pt) => (
            <span
              key={pt}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] shrink-0 capitalize"
            >
              <span>{pt}</span>
              <button
                type="button"
                onClick={() => dispatch(togglePropertyType(pt))}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filter.amenities.map((am) => (
            <span
              key={am}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] shrink-0"
            >
              <span>{am}</span>
              <button
                type="button"
                onClick={() => dispatch(toggleAmenity(am))}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={() => dispatch(resetFilters())}
            className="text-[11px] font-sans font-semibold text-rose-600 dark:text-rose-400 hover:underline shrink-0 flex items-center gap-1 cursor-pointer ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* 4. Main Search Content: Natural document scroll on mobile, split-locked on desktop */}
      <div
        className={`flex-1 ${
          isMapViewOpen
            ? "min-h-0 overflow-hidden p-0 sm:px-6 sm:py-2.5"
            : "lg:min-h-0 overflow-visible lg:overflow-hidden px-3 sm:px-6 lg:px-8 py-2.5"
        } grid grid-cols-1 lg:grid-cols-12 gap-3 lg:px-8 relative`}
      >
        {/* Left Column: Filter Sidebar - Desktop Sticky Stationary */}
        <aside
          className={`hidden ${
            isMapViewOpen
              ? "xl:block xl:col-span-3 2xl:col-span-2.5"
              : "lg:block lg:col-span-4 xl:col-span-3 2xl:col-span-2.5"
          } h-full overflow-hidden`}
        >
          <SearchSidebar
            filteredCount={sortedListings.length}
            totalCount={allListings.length}
          />
        </aside>

        {/* Mobile Filter Modal Bottom Sheet Drawer */}
        {isMobileFilterOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <div
              className="w-full h-[88vh] max-h-[88vh] bg-white dark:bg-neutral-900 rounded-t-3xl flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchSidebar
                filteredCount={sortedListings.length}
                totalCount={allListings.length}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Listings Column: Hidden on mobile when map view is active; standalone column scroll on desktop */}
        <main
          ref={listingsContainerRef}
          className={`scrollbar-thin scrollbar-thumb-brand-primary/70 scrollbar-track-sky-50 ${
            isMapViewOpen
              ? "hidden lg:block lg:col-span-6 xl:col-span-4 2xl:col-span-4.5"
              : "block col-span-1 lg:col-span-8 xl:col-span-9 2xl:col-span-9.5"
          } min-w-0 h-auto lg:h-full overflow-visible lg:overflow-y-auto pr-0 sm:pr-1.5 lg:custom-scrollbar space-y-4 pb-16 lg:pb-6`}
        >
          {/* Near Me Active GPS Banner */}
          {isNearMe && userCoords && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-primary-light/40 dark:bg-brand-primary/10 border border-brand-primary/25 text-neutral-900 dark:text-white animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-primary shrink-0 shadow-2xs">
                  <LocateFixed className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-heading font-semibold truncate">
                    {filter.location ? `Stays near ${filter.location}` : "Stays near your GPS location"}
                  </p>
                  <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 truncate">
                    Ranked by real-time distance ({userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch(setIsNearMeActive(false));
                  dispatch(setLocation(""));
                  router.push("/search");
                }}
                className="text-xs font-sans font-semibold text-brand-primary hover:underline px-2.5 py-1 rounded-lg hover:bg-brand-primary/10 transition cursor-pointer shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          {searchLoading ? (
            <div role="status" className="p-10 text-center text-neutral-500">Searching available stays…</div>
          ) : searchError ? (
            <div role="alert" className="p-10 text-center text-rose-700">{searchError}<button type="button" className="ml-3 underline" onClick={retrySearch}>Retry</button></div>
          ) : currentItems.length > 0 ? (
            <>
              <div
                className={`grid ${
                  isMapViewOpen
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-3 sm:gap-3.5"
                    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4"
                }`}
              >
                {currentItems.map((listing) => {
                  const isHovered = hoveredListingId === listing.id;
                  const isSelected = selectedListingId === listing.id;

                  return (
                    <div
                      key={listing.id}
                      id={`listing-card-${listing.id}`}
                      onMouseEnter={() => setHoveredListingId(listing.id)}
                      onMouseLeave={() => setHoveredListingId(null)}
                      className={`transition-all duration-200 rounded-2xl ${
                        isSelected
                          ? "ring-2 ring-brand-primary p-1 bg-brand-primary/5 shadow-md"
                          : isHovered
                            ? "ring-1.5 ring-brand-primary/60 p-0.5"
                            : ""
                      }`}
                    >
                      <ListingCard
                        listing={listing}
                        distanceKm={listingDistances[listing.id]}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Pagination */}
              <div className="pt-2 pb-6">
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedListings.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 max-w-xl mx-auto p-8 shadow-xs animate-fade-in my-auto">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mx-auto mb-4">
                <Calendar1 className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-semibold text-neutral-900 dark:text-white text-xl">
                No Sanctuaries Match Your Criteria
              </h3>
              <p className="text-xs font-serif text-neutral-500 dark:text-neutral-400 mt-2 mb-6 max-w-md mx-auto leading-relaxed">
                Try clearing some filters, moving the map to another location,
                or widening your price range.
              </p>
              <button
                type="button"
                onClick={() => dispatch(resetFilters())}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold transition-all duration-200 shadow-md shadow-brand-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </main>

        {/* Right Column: Leaflet Map (On mobile: full-screen map experience; on desktop: split locked column) */}
        {isMapViewOpen && (
          <div className="col-span-1 lg:col-span-6 xl:col-span-5 2xl:col-span-5 h-full w-full rounded-none sm:rounded-2xl overflow-hidden relative">
            <SearchMapWrapper
              items={sortedListings}
              isFetching={isMapFetching}
              isLoading={isMapLoading}
              isError={isMapError}
              hoveredId={hoveredListingId}
              selectedId={selectedListingId}
              onHoverItem={setHoveredListingId}
              onSelectItem={(id) => {
                setSelectedListingId(id);
                const el = document.getElementById(`listing-card-${id}`);
                if (el) {
                  el.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
              onBoundsChange={setMapBounds}
              searchOnMove={searchOnMove}
              onToggleSearchOnMove={setSearchOnMove}
              onRetry={() => refetchMap()}
              userLocation={userCoords}
            />

            {/* Mobile Floating Selected Listing Card Preview on Map */}
            {selectedListing && (
              <div className="lg:hidden absolute bottom-4 left-3 right-3 z-[1000] animate-fade-in-up pointer-events-auto">
                <div className="relative bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-neutral-200/90 dark:border-neutral-800 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedListingId(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md z-10 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={selectedListing.images[0] || "/placeholder.jpg"}
                      alt={selectedListing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary">
                      <Star className="w-3 h-3 fill-brand-primary text-brand-primary" />
                      <span>{selectedListing.rating.toFixed(2)}</span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {selectedListing.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {selectedListing.location.city},{" "}
                      {selectedListing.location.country}
                    </p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                      {formatPrice(selectedListing.pricePerNight)}{" "}
                      <span className="font-normal text-[10px] text-neutral-400">
                        / night
                      </span>
                    </p>
                  </div>
                  <Link
                    href={`/listings/${selectedListing.id}`}
                    className="px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shrink-0 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
