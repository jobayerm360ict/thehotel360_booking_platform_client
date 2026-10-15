"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Plus,
  Minus,
  LocateFixed,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLocation,
  setDates,
  setGuests,
  setNearMeSearch,
} from "@/store/slices/filterSlice";
import { setSearchExpanded, setActiveSearchTab } from "@/store/slices/uiSlice";
import { formatGuestSummary } from "@/lib/utils";
import { getCurrentCoordinates, reverseGeocode } from "@/lib/geolocation";
import { Calendar } from "@/components/ui/calendar";

const POPULAR_DESTINATIONS = [
  { name: "Santorini, Greece", label: "Famous caldera sunsets", icon: "🇬🇷" },
  {
    name: "Kyoto, Japan",
    label: "Historic zen machiyas & temples",
    icon: "🇯🇵",
  },
  {
    name: "Lake Como, Italy",
    label: "Waterfront elegance & villas",
    icon: "🇮🇹",
  },
  {
    name: "Sreemangal, Bangladesh",
    label: "Secluded tea sanctuary villas",
    icon: "🍃",
  },
  {
    name: "Sajek Valley, Bangladesh",
    label: "Cloud peak timber chalets",
    icon: "☁️",
  },
  {
    name: "Cox's Bazar, Bangladesh",
    label: "Inani private coastal estates",
    icon: "🌊",
  },
];

export function SearchExpandedBar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const filter = useAppSelector((state) => state.filter);
  const activeTab = useAppSelector((state) => state.ui.activeSearchTab);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeof window !== "undefined" && window.innerWidth < 768) return;
      if ((e.target as HTMLElement)?.closest?.("[data-mobile-search-modal]"))
        return;

      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        dispatch(setSearchExpanded(false));
        dispatch(setActiveSearchTab(null));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(setSearchExpanded(false));
    dispatch(setActiveSearchTab(null));
    if (filter.location) {
      router.push(`/search?location=${encodeURIComponent(filter.location)}`);
    } else {
      router.push("/search");
    }
  };

  const handleNearMe = async () => {
    try {
      setIsLocating(true);
      const coords = await getCurrentCoordinates();
      const placeName = await reverseGeocode(coords.lat, coords.lng);
      dispatch(
        setNearMeSearch({
          location: placeName,
          coordinates: coords,
        })
      );
      dispatch(setSearchExpanded(false));
      dispatch(setActiveSearchTab(null));
      toast.success(
        placeName !== "Current Location"
          ? `Found your location: ${placeName}`
          : "Location retrieved! Searching nearby stays..."
      );
      router.push(
        `/search?nearMe=true&lat=${coords.lat.toFixed(5)}&lng=${coords.lng.toFixed(5)}&location=${encodeURIComponent(placeName)}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve location";
      toast.error(msg);
    } finally {
      setIsLocating(false);
    }
  };

  const updateGuest = (
    type: "adults" | "children" | "infants" | "pets",
    change: number,
  ) => {
    const current = filter.guests[type];
    const updated = Math.max(type === "adults" ? 1 : 0, current + change);
    dispatch(setGuests({ [type]: updated }));
  };

  return (
    <>
      {/* Invisible Backdrop on Desktop */}
      <div
        className="hidden md:block fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          dispatch(setSearchExpanded(false));
          dispatch(setActiveSearchTab(null));
        }}
      />

      {/* Desktop Capsule Search Bar */}
      <div
        ref={containerRef}
        className="hidden md:block relative z-50 pb-5 pt-1 animate-in fade-in slide-in-from-top-3 duration-300 max-w-4xl mx-auto"
      >
        <div className="relative bg-white dark:bg-neutral-900/95 backdrop-blur-md rounded-full p-2 border border-neutral-200/80 dark:border-neutral-700 shadow-2xl flex items-center divide-x divide-neutral-200/70 dark:divide-neutral-700 transition-all duration-300">
          {/* Destination Tab */}
          <div
            onClick={() => dispatch(setActiveSearchTab("where"))}
            className={`relative flex-1 px-6 py-3 rounded-full cursor-pointer transition-all duration-300 ease-out ${
              activeTab === "where"
                ? "bg-brand-primary-light/50 dark:bg-neutral-800 shadow-sm ring-1 ring-brand-primary/20 scale-[1.01]"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            }`}
          >
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
              Where to explore
            </label>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <input
                type="text"
                value={filter.location}
                onChange={(e) => dispatch(setLocation(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search by city, hotel, or neighborhood"
                className="w-full bg-transparent text-sm font-serif font-normal text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNearMe();
                }}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium bg-neutral-100 hover:bg-neutral-200/90 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 hover:border-brand-primary/40 dark:hover:border-brand-primary/40 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 shrink-0 shadow-2xs group cursor-pointer"
                title="Search near my current location"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5 text-neutral-500 group-hover:text-brand-primary transition-colors" />
                )}
                <span className="font-sans font-medium text-xs whitespace-nowrap">
                  {isLocating ? "Locating..." : "Near me"}
                </span>
              </button>
            </div>

            {/* Destination Popover Dropdown */}
            {activeTab === "where" && (
              <div
                className="absolute left-0 top-full mt-3 w-[420px] bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-neutral-100 dark:border-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Near me quick option inside popover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNearMe();
                  }}
                  disabled={isLocating}
                  className="w-full flex items-center gap-3 p-3 mb-3 rounded-2xl bg-brand-primary-light/40 hover:bg-brand-primary-light dark:bg-neutral-800/80 dark:hover:bg-neutral-800 border border-brand-primary/20 hover:border-brand-primary/40 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-98 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {isLocating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-heading font-semibold text-brand-primary dark:text-brand-primary-light">
                        {isLocating ? "Detecting location..." : "Use Current Location"}
                      </p>
                      <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary dark:bg-brand-primary/25">
                        Near me
                      </span>
                    </div>
                    <p className="text-xs font-serif text-neutral-500 dark:text-neutral-400 truncate">
                      Find stays closest to your real-time GPS position
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-neutral-400">
                    Curated Destinations
                  </span>
                  {filter.location && (
                    <button
                      type="button"
                      onClick={() => dispatch(setLocation(""))}
                      className="text-xs text-brand-primary hover:underline font-sans font-semibold cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      type="button"
                      key={dest.name}
                      onClick={() => {
                        dispatch(setLocation(dest.name.split(",")[0].trim()));
                        dispatch(setActiveSearchTab("checkIn"));
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:pl-4 active:scale-98 text-left group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-110">
                        {dest.icon}
                      </div>
                      <div>
                        <p className="text-sm font-heading font-semibold text-neutral-900 dark:text-white group-hover:text-brand-primary transition-colors">
                          {dest.name}
                        </p>
                        <p className="text-xs font-serif text-neutral-500 dark:text-neutral-400">
                          {dest.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates Tab with Interactive Calendar */}
          <div
            onClick={() => dispatch(setActiveSearchTab("checkIn"))}
            className={`relative flex-1 px-6 py-3 rounded-full cursor-pointer transition-all duration-300 ease-out ${
              activeTab === "checkIn" || activeTab === "checkOut"
                ? "bg-brand-primary-light/50 dark:bg-neutral-800 shadow-sm ring-1 ring-brand-primary/20 scale-[1.01]"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            }`}
          >
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
              Travel Dates
            </label>
            <p className="text-sm font-serif font-normal text-neutral-900 dark:text-white truncate mt-0.5">
              {filter.checkIn && filter.checkOut
                ? `${filter.checkIn} → ${filter.checkOut}`
                : filter.checkIn
                  ? `${filter.checkIn} → Add end date`
                  : "Select dates"}
            </p>

            {/* Interactive Wide 2-Month Date Range Popover */}
            {(activeTab === "checkIn" || activeTab === "checkOut") && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[760px] lg:w-[800px] z-50 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar
                  startDate={filter.checkIn}
                  endDate={filter.checkOut}
                  monthsToShow={2}
                  onApply={() => dispatch(setActiveSearchTab("who"))}
                  onChange={({ startDate: s, endDate: e }) => {
                    dispatch(setDates({ checkIn: s, checkOut: e }));
                    if (s && e) {
                      setTimeout(
                        () => dispatch(setActiveSearchTab("who")),
                        350,
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Guests Tab + Search Button */}
          <div
            onClick={() => dispatch(setActiveSearchTab("who"))}
            className={`relative flex-[1.2] px-6 py-2 rounded-full cursor-pointer flex items-center justify-between transition-all duration-300 ease-out ${
              activeTab === "who"
                ? "bg-brand-primary-light/50 dark:bg-neutral-800 shadow-sm ring-1 ring-brand-primary/20 scale-[1.01]"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            }`}
          >
            <div className="truncate pr-3">
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                Guests & Party
              </label>
              <p className="text-sm font-serif font-normal text-neutral-900 dark:text-white truncate mt-0.5">
                {formatGuestSummary(filter.guests)}
              </p>
            </div>

            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="flex items-center gap-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-semibold px-6 py-3.5 rounded-full shadow-lg shadow-brand-primary/25 cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
              <span className="text-sm">Search</span>
            </button>

            {/* Guests Popover */}
            {activeTab === "who" && (
              <div
                className="absolute right-0 top-full mt-3 w-[380px] bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
                        Adults
                      </h4>
                      <p className="text-xs font-serif text-neutral-500">
                        Age 13 or above
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateGuest("adults", -1)}
                        disabled={filter.guests.adults <= 1}
                        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center hover:border-neutral-800 cursor-pointer disabled:cursor-not-allowed hover:scale-110 active:scale-90 disabled:hover:scale-100 disabled:opacity-30 transition-all duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-sans font-semibold text-sm w-4 text-center">
                        {filter.guests.adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateGuest("adults", 1)}
                        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center hover:border-neutral-800 cursor-pointer hover:scale-110 active:scale-90 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
                        Children
                      </h4>
                      <p className="text-xs font-serif text-neutral-500">
                        Ages 2–12
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateGuest("children", -1)}
                        disabled={filter.guests.children <= 0}
                        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center hover:border-neutral-800 cursor-pointer disabled:cursor-not-allowed hover:scale-110 active:scale-90 disabled:hover:scale-100 disabled:opacity-30 transition-all duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-sans font-semibold text-sm w-4 text-center">
                        {filter.guests.children}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateGuest("children", 1)}
                        className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center hover:border-neutral-800 cursor-pointer hover:scale-110 active:scale-90 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          setGuests({
                            adults: 1,
                            children: 0,
                            infants: 0,
                            pets: 0,
                          }),
                        )
                      }
                      className="text-xs font-sans font-semibold text-neutral-500 hover:text-brand-primary underline cursor-pointer"
                    >
                      Reset guests
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-sans font-semibold shadow-md shadow-brand-primary/20 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      Apply & Search
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
