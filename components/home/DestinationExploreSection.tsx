"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
  Building2,
  Waves,
  Mountain,
  Trees,
  TreePine,
  Palmtree,
  ChevronRight,
} from "lucide-react";

interface DestinationItem {
  id: string;
  name: string;
  bnName: string;
  tagline: string;
  query: string;
  image: string;
  icon: React.ElementType;
}

const DESTINATIONS: DestinationItem[] = [
  {
    id: "all",
    name: "All Destinations",
    bnName: "সকল গন্তব্য",
    tagline: "Explore all sanctuaries across regions",
    query: "",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    icon: Compass,
  },
  {
    id: "dhaka",
    name: "Dhaka",
    bnName: "ঢাকা",
    tagline: "Metropolitan suites, luxury apartments & cozy stays",
    query: "Dhaka",
    image:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
    icon: Building2,
  },
  {
    id: "coxs-bazar",
    name: "Cox's Bazar",
    bnName: "কক্সবাজার",
    tagline: "Beachfront villas, sunset suites & ocean views",
    query: "Cox's Bazar",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
    icon: Waves,
  },
  {
    id: "chattogram",
    name: "Chattogram",
    bnName: "চট্টগ্রাম",
    tagline: "Hilltop penthouses, bayview residences & city studios",
    query: "Chattogram",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    icon: Mountain,
  },
  {
    id: "sylhet",
    name: "Sylhet",
    bnName: "সিলেট ও শ্রীমঙ্গল",
    tagline: "Tea garden eco-cottages & serene duplex villas",
    query: "Sylhet",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    icon: Trees,
  },
  {
    id: "barishal",
    name: "Barishal",
    bnName: "বরিশাল",
    tagline: "Riverfront suites & peaceful garden retreats",
    query: "Barishal",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    icon: TreePine,
  },
];

export function DestinationExploreSection() {
  const allListings = useAppSelector((state) => state.listings.items);
  const [activeDestId, setActiveDestId] = useState<string>("dhaka");

  const activeDestination =
    DESTINATIONS.find((d) => d.id === activeDestId) || DESTINATIONS[1];

  // Calculate listing counts for each destination
  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DESTINATIONS.forEach((dest) => {
      if (dest.id === "all") {
        counts[dest.id] = allListings.length;
      } else {
        const q = dest.query.toLowerCase();
        counts[dest.id] = allListings.filter(
          (l) =>
            l.location.city.toLowerCase().includes(q) ||
            (l.location.state && l.location.state.toLowerCase().includes(q)) ||
            l.location.country.toLowerCase().includes(q) ||
            l.title.toLowerCase().includes(q),
        ).length;
      }
    });
    return counts;
  }, [allListings]);

  // Filter listings based on active destination
  const filteredListings = useMemo(() => {
    if (activeDestId === "all") {
      return allListings;
    }
    const q = activeDestination.query.toLowerCase();
    return allListings.filter(
      (l) =>
        l.location.city.toLowerCase().includes(q) ||
        (l.location.state && l.location.state.toLowerCase().includes(q)) ||
        l.location.country.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q),
    );
  }, [allListings, activeDestId, activeDestination]);

  return (
    <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-16 py-4 sm:py-6 space-y-5">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-neutral-200/70 dark:border-neutral-800/80 pb-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Explore by Top Destinations
          </h2>
        </div>

        {activeDestId !== "all" && (
          <Link
            href={`/search?location=${encodeURIComponent(activeDestination.name)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-brand-primary hover:text-brand-primary transition shrink-0 group"
          >
            <span>View all in {activeDestination.name}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* 2. Visual Destination Selector Cards / Pills Slider */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {DESTINATIONS.map((dest) => {
          const isSelected = activeDestId === dest.id;
          const count = destinationCounts[dest.id] || 0;
          const Icon = dest.icon;

          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => setActiveDestId(dest.id)}
              className={`relative overflow-hidden rounded-2xl p-3 sm:p-3.5 text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between h-28 sm:h-32 group select-none ${
                isSelected
                  ? "ring-2 ring-brand-primary border-transparent shadow-md scale-102"
                  : "border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-xs"
              }`}
            >
              {/* Background preview image on hover/selected */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                  isSelected
                    ? "opacity-25 dark:opacity-20"
                    : "opacity-0 group-hover:opacity-10 dark:group-hover:opacity-10"
                }`}
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Top Icon & Count Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-brand-primary text-white shadow-xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-brand-primary text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {count} {count === 1 ? "Stay" : "Stays"}
                </span>
              </div>

              {/* Bottom Destination Labels */}
              <div className="relative z-10 mt-2">
                <h4
                  className={`font-heading font-bold text-sm sm:text-base leading-tight truncate transition-colors ${
                    isSelected
                      ? "text-brand-primary dark:text-white"
                      : "text-neutral-900 dark:text-white group-hover:text-brand-primary"
                  }`}
                >
                  {dest.name}
                </h4>
                <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {dest.bnName}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Destination Context Bar & Quick Filter Count */}
      <div className="flex items-center justify-between bg-neutral-100/70 dark:bg-neutral-900/60 p-3 sm:px-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800 text-xs font-sans">
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
          <span>
            Sanctuaries in{" "}
            <strong className="text-neutral-900 dark:text-white font-bold">
              {activeDestination.name}
            </strong>
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-serif hidden sm:inline truncate">
            {activeDestination.tagline}
          </span>
        </div>

        <span className="font-semibold text-brand-secondary shrink-0">
          {filteredListings.length} properties available
        </span>
      </div>

      {/* 4. Filtered Listings Grid */}
      {filteredListings.length > 0 ? (
        <div
          key={activeDestId}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5 animate-fade-in"
        >
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-10 text-center border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-heading font-bold text-base text-neutral-900 dark:text-white">
            No Sanctuaries Found in {activeDestination.name}
          </h3>
          <p className="text-xs font-serif text-neutral-500 max-w-sm mx-auto">
            We are actively onboarding verified luxury sanctuaries in this
            destination. Try exploring other cities or browse all sanctuaries.
          </p>
          <button
            type="button"
            onClick={() => setActiveDestId("all")}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-sans font-semibold hover:bg-brand-primary-hover shadow-xs transition"
          >
            Show All Destinations
          </button>
        </div>
      )}
    </section>
  );
}
