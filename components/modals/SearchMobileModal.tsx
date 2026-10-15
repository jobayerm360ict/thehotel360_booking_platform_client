"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Plus,
  Minus,
  X,
  Compass,
  ChevronDown,
  ArrowRight,
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
import {
  formatGuestSummary,
  formatDateRange,
  calculateNights,
} from "@/lib/utils";
import { getCurrentCoordinates, reverseGeocode } from "@/lib/geolocation";
import { Calendar } from "@/components/ui/calendar";

interface DestinationOption {
  name: string;
  shortName: string;
  label: string;
  icon: string;
  keywords: string[];
}

const ALL_DESTINATIONS: DestinationOption[] = [
  {
    name: "Sreemangal, Sylhet",
    shortName: "Sreemangal",
    label: "Tea sanctuary estates & rain forests",
    icon: "🍃",
    keywords: ["sreemangal", "sylhet", "tea", "bangladesh"],
  },
  {
    name: "Cox's Bazar, Chittagong",
    shortName: "Cox's Bazar",
    label: "Inani private beach villas & coastal sunsets",
    icon: "🌊",
    keywords: ["cox's bazar", "coxs", "inani", "beach", "sea", "bangladesh"],
  },
  {
    name: "Sajek Valley, Rangamati",
    shortName: "Sajek Valley",
    label: "Cloud peak timber chalets & hill tracts",
    icon: "☁️",
    keywords: ["sajek", "rangamati", "cloud", "hill", "bangladesh"],
  },
  {
    name: "Gulshan & Banani, Dhaka",
    shortName: "Gulshan",
    label: "Diplomatic zone luxury penthouses",
    icon: "🏙️",
    keywords: ["gulshan", "banani", "dhaka", "bangladesh", "city"],
  },
  {
    name: "Bashundhara R/A, Dhaka",
    shortName: "Bashundhara",
    label: "Gated serene duplexes & studio suites",
    icon: "🏡",
    keywords: ["bashundhara", "dhaka", "bangladesh"],
  },
  {
    name: "Dhanmondi, Dhaka",
    shortName: "Dhanmondi",
    label: "Lakefront architectural sanctuaries",
    icon: "🌳",
    keywords: ["dhanmondi", "dhaka", "lake", "bangladesh"],
  },
  {
    name: "Santorini, Greece",
    shortName: "Santorini",
    label: "Caldera cliffside cave villas",
    icon: "🇬🇷",
    keywords: ["santorini", "greece", "oia", "caldera", "island"],
  },
  {
    name: "Kyoto, Japan",
    shortName: "Kyoto",
    label: "Historic zen machiyas & bamboo forest",
    icon: "🇯🇵",
    keywords: ["kyoto", "japan", "asia", "zen", "temple"],
  },
  {
    name: "Lake Como, Italy",
    shortName: "Lake Como",
    label: "Renaissance waterfront villas",
    icon: "🇮🇹",
    keywords: ["lake como", "como", "italy", "europe", "lake"],
  },
  {
    name: "Bali, Indonesia",
    shortName: "Bali",
    label: "Ubud jungle infinity pools & treehouses",
    icon: "🇮🇩",
    keywords: ["bali", "indonesia", "ubud", "tropical"],
  },
  {
    name: "Zermatt, Switzerland",
    shortName: "Zermatt",
    label: "Matterhorn ski-in ski-out luxury chalets",
    icon: "🇨🇭",
    keywords: ["zermatt", "switzerland", "matterhorn", "alps", "snow"],
  },
];

export function SearchMobileModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const globalFilter = useAppSelector((state) => state.filter);
  const isSearchExpanded = useAppSelector((state) => state.ui.isSearchExpanded);

  const [mounted, setMounted] = useState(false);

  // Accordion open section: "where" | "when" | "who" | null (starts with "where" open)
  const [openSection, setOpenSection] = useState<
    "where" | "when" | "who" | null
  >("where");

  // Local state for all fields
  const [locationValue, setLocationValue] = useState("");
  const [checkInValue, setCheckInValue] = useState<string | null>(null);
  const [checkOutValue, setCheckOutValue] = useState<string | null>(null);
  const [guestsValue, setGuestsValue] = useState({
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [isLocating, setIsLocating] = useState(false);

  const handleNearMe = async () => {
    try {
      setIsLocating(true);
      const coords = await getCurrentCoordinates();
      const placeName = await reverseGeocode(coords.lat, coords.lng);
      setLocationValue(placeName);
      dispatch(
        setNearMeSearch({
          location: placeName,
          coordinates: coords,
        })
      );
      toast.success(
        placeName !== "Current Location"
          ? `Found your location: ${placeName}`
          : "Location retrieved! Searching nearby stays..."
      );
      dispatch(setSearchExpanded(false));
      dispatch(setActiveSearchTab(null));
      router.push(
        `/search?nearMe=true&lat=${coords.lat.toFixed(5)}&lng=${coords.lng.toFixed(5)}&location=${encodeURIComponent(placeName)}`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to retrieve location";
      toast.error(msg);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isSearchExpanded) {
      setLocationValue(globalFilter.location || "");
      setCheckInValue(globalFilter.checkIn || null);
      setCheckOutValue(globalFilter.checkOut || null);
      setGuestsValue(
        globalFilter.guests || { adults: 2, children: 0, infants: 0, pets: 0 },
      );
      setOpenSection("where");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchExpanded, globalFilter]);

  // Filter destination suggestions dynamically as user types
  const filteredDestinations = useMemo(() => {
    const q = locationValue.trim().toLowerCase();
    if (!q) return ALL_DESTINATIONS;
    return ALL_DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.shortName.toLowerCase().includes(q) ||
        d.label.toLowerCase().includes(q) ||
        d.keywords.some((k) => k.includes(q)),
    );
  }, [locationValue]);

  if (!mounted || !isSearchExpanded) return null;

  const handleClose = () => {
    dispatch(setSearchExpanded(false));
    dispatch(setActiveSearchTab(null));
  };

  const handleClearAll = () => {
    setLocationValue("");
    setCheckInValue(null);
    setCheckOutValue(null);
    setGuestsValue({ adults: 1, children: 0, infants: 0, pets: 0 });
    setOpenSection("where");
  };

  const handleApplyAndSearch = () => {
    // Commit local state to Redux
    dispatch(setLocation(locationValue.trim()));
    dispatch(setDates({ checkIn: checkInValue, checkOut: checkOutValue }));
    dispatch(setGuests(guestsValue));

    // Close modal
    dispatch(setSearchExpanded(false));
    dispatch(setActiveSearchTab(null));

    // Navigate to search
    if (locationValue.trim()) {
      router.push(
        `/search?location=${encodeURIComponent(locationValue.trim())}`,
      );
    } else {
      router.push("/search");
    }
  };

  const handleSelectDestination = (destName: string) => {
    setLocationValue(destName);
    // Smoothly auto-open the Date section
    setTimeout(() => {
      setOpenSection("when");
    }, 200);
  };

  const updateGuest = (type: "adults" | "children", change: number) => {
    setGuestsValue((prev) => {
      const current = prev[type];
      const updated = Math.max(type === "adults" ? 1 : 0, current + change);
      return { ...prev, [type]: updated };
    });
  };

  const totalGuests = guestsValue.adults + guestsValue.children;
  const nightsCount =
    checkInValue && checkOutValue
      ? calculateNights(checkInValue, checkOutValue)
      : null;

  const hasAnySelection = Boolean(
    locationValue || checkInValue || checkOutValue || totalGuests > 1,
  );

  const modalContent = (
    <div
      data-mobile-search-modal="true"
      className="md:hidden fixed inset-0 z-[9999] bg-[#fcfbf9] dark:bg-neutral-950 flex flex-col h-[100dvh] w-screen overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* 1. Header (Clean & Minimal) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
          aria-label="Close search"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-heading font-semibold text-sm text-neutral-900 dark:text-white">
          <Compass className="w-4 h-4 text-brand-primary" />
          <span>Search Sanctuaries</span>
        </div>

        <div className="w-8" />
      </div>

      {/* 2. Scrollable Accordion Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
        {/* ========================================================================= */}
        {/* ACCORDION 1: WHERE (LOCATION)                                            */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Header Row / Collapsed View */}
          <button
            type="button"
            onClick={() =>
              setOpenSection(openSection === "where" ? null : "where")
            }
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  openSection === "where"
                    ? "bg-brand-primary text-white"
                    : "bg-brand-primary/10 text-brand-primary"
                }`}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Where to explore?
                </span>
                <span className="block font-heading font-semibold text-sm text-neutral-900 dark:text-white mt-0.5 truncate max-w-[220px]">
                  {locationValue || "Search destinations"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                openSection === "where" ? "rotate-180 text-brand-primary" : ""
              }`}
            />
          </button>

          {/* Expanded Content */}
          {openSection === "where" && (
            <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 space-y-3 animate-in fade-in duration-200">
              {/* Interactive Search Input with Near Me button */}
              <div className="flex items-center gap-2 mt-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-brand-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (locationValue.trim()) {
                          setOpenSection("when");
                        }
                      }
                    }}
                    placeholder="Search by city, hotel, or neighborhood"
                    className="w-full text-xs font-sans pl-10 pr-9 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  {locationValue && (
                    <button
                      type="button"
                      onClick={() => setLocationValue("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNearMe}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-sans font-medium bg-neutral-100 hover:bg-neutral-200/90 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 hover:border-brand-primary/40 dark:hover:border-brand-primary/40 shrink-0 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-60 transition"
                  title="Search near my current location"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5 text-brand-primary" />
                  )}
                  <span className="whitespace-nowrap font-medium text-xs">
                    {isLocating ? "Locating..." : "Near me"}
                  </span>
                </button>
              </div>

              {/* Dynamic Suggestions List */}
              <div className="space-y-2 pt-1">
                {/* Use Current Location Quick Card */}
                <button
                  type="button"
                  onClick={handleNearMe}
                  disabled={isLocating}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-brand-primary-light/40 hover:bg-brand-primary-light dark:bg-neutral-800/80 dark:hover:bg-neutral-800 border border-brand-primary/20 text-left transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
                    {isLocating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LocateFixed className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-heading font-semibold text-brand-primary">
                        {isLocating ? "Detecting location..." : "Use Current Location"}
                      </p>
                      <span className="text-[9px] uppercase font-sans font-bold px-1.5 py-0.2 rounded-full bg-brand-primary/15 text-brand-primary">
                        Near me
                      </span>
                    </div>
                    <p className="text-[10px] font-serif text-neutral-500 dark:text-neutral-400 truncate">
                      Find stays closest to where you are right now
                    </p>
                  </div>
                </button>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                    {locationValue.trim()
                      ? `Matching Destinations (${filteredDestinations.length})`
                      : "Curated Escapes & Sanctuaries"}
                  </span>
                </div>

                {filteredDestinations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {filteredDestinations.map((dest) => {
                      const isSelected =
                        locationValue.toLowerCase() ===
                        dest.shortName.toLowerCase();
                      return (
                        <button
                          key={dest.name}
                          type="button"
                          onClick={() =>
                            handleSelectDestination(dest.shortName)
                          }
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition border cursor-pointer ${
                            isSelected
                              ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-xs"
                              : "bg-neutral-50/70 dark:bg-neutral-800/60 border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          <span className="text-xl shrink-0">{dest.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-sans font-semibold text-neutral-900 dark:text-white truncate">
                              {dest.name}
                            </p>
                            <p className="text-[10px] font-serif text-neutral-400 truncate">
                              {dest.label}
                            </p>
                          </div>
                          <span className="text-[11px] font-sans font-semibold text-brand-primary shrink-0 opacity-80">
                            Select →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs font-sans text-neutral-400">
                      No matching destination found for &quot;{locationValue}
                      &quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenSection("when")}
                      className="mt-2 text-xs font-sans font-semibold text-brand-primary underline"
                    >
                      Use &quot;{locationValue}&quot; and select dates →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACCORDION 2: WHEN (DATES)                                                */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Header Row / Collapsed View */}
          <button
            type="button"
            onClick={() =>
              setOpenSection(openSection === "when" ? null : "when")
            }
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  openSection === "when"
                    ? "bg-brand-primary text-white"
                    : "bg-brand-primary/10 text-brand-primary"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  When is your stay?
                </span>
                <span className="block font-heading font-semibold text-sm text-neutral-900 dark:text-white mt-0.5 truncate max-w-[220px]">
                  {checkInValue
                    ? `${formatDateRange(checkInValue, checkOutValue)}${
                        nightsCount ? ` (${nightsCount}n)` : ""
                      }`
                    : "Add travel dates"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                openSection === "when" ? "rotate-180 text-brand-primary" : ""
              }`}
            />
          </button>

          {/* Expanded Content */}
          {openSection === "when" && (
            <div className="p-3 sm:p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-200 space-y-3">
              <div className="pt-2">
                <Calendar
                  startDate={checkInValue}
                  endDate={checkOutValue}
                  monthsToShow={1}
                  onChange={({ startDate: s, endDate: e }) => {
                    setCheckInValue(s);
                    setCheckOutValue(e);
                    if (s && e) {
                      // Smoothly auto-open the guests section after dates picked
                      setTimeout(() => setOpenSection("who"), 300);
                    }
                  }}
                />
              </div>

              {(checkInValue || checkOutValue) && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInValue(null);
                      setCheckOutValue(null);
                    }}
                    className="text-xs font-sans font-semibold text-brand-primary hover:underline"
                  >
                    Clear Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenSection("who")}
                    className="text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:text-brand-primary flex items-center gap-1"
                  >
                    <span>Next: Add Guests</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACCORDION 3: WHO (GUESTS)                                                */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Header Row / Collapsed View */}
          <button
            type="button"
            onClick={() => setOpenSection(openSection === "who" ? null : "who")}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  openSection === "who"
                    ? "bg-brand-primary text-white"
                    : "bg-brand-primary/10 text-brand-primary"
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Who&apos;s traveling?
                </span>
                <span className="block font-heading font-semibold text-sm text-neutral-900 dark:text-white mt-0.5 truncate max-w-[220px]">
                  {totalGuests} guest{totalGuests > 1 ? "s" : ""}{" "}
                  <span className="text-xs font-normal text-neutral-400">
                    ({guestsValue.adults} adults
                    {guestsValue.children > 0
                      ? `, ${guestsValue.children} children`
                      : ""}
                    )
                  </span>
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                openSection === "who" ? "rotate-180 text-brand-primary" : ""
              }`}
            />
          </button>

          {/* Expanded Content */}
          {openSection === "who" && (
            <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 animate-in fade-in duration-200">
              {/* Adults */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-heading font-semibold text-neutral-900 dark:text-white">
                    Adults
                  </p>
                  <p className="text-[10px] font-serif text-neutral-400">
                    Age 13 or above
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateGuest("adults", -1)}
                    disabled={guestsValue.adults <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs disabled:opacity-30 active:scale-90 hover:border-neutral-800 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-sans font-semibold w-4 text-center">
                    {guestsValue.adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateGuest("adults", 1)}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs active:scale-90 hover:border-neutral-800 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-heading font-semibold text-neutral-900 dark:text-white">
                    Children
                  </p>
                  <p className="text-[10px] font-serif text-neutral-400">
                    Ages 2–12
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateGuest("children", -1)}
                    disabled={guestsValue.children <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs disabled:opacity-30 active:scale-90 hover:border-neutral-800 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-sans font-semibold w-4 text-center">
                    {guestsValue.children}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateGuest("children", 1)}
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs active:scale-90 hover:border-neutral-800 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar (Single, Clean, Efficient) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xl z-20">
        <button
          type="button"
          onClick={handleClearAll}
          disabled={!hasAnySelection}
          className={`text-xs font-sans font-semibold px-2 transition ${
            hasAnySelection
              ? "text-neutral-600 dark:text-neutral-300 hover:text-brand-primary underline cursor-pointer"
              : "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
          }`}
        >
          Clear all
        </button>

        <button
          type="button"
          onClick={handleApplyAndSearch}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
          <span>
            Search Sanctuaries
            {totalGuests > 0 ? ` (${totalGuests} guests)` : ""}
          </span>
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
