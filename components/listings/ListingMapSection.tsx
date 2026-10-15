"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Maximize2,
  Plus,
  Minus,
  Home,
  MapPin,
  Navigation,
  Compass,
  Train,
  Coffee,
  GraduationCap,
  Shield,
  Layers,
  ExternalLink,
} from "lucide-react";

interface ListingMapSectionProps {
  location: {
    city: string;
    state?: string;
    country: string;
    neighborhood?: string;
    distance?: string;
  };
  listingTitle?: string;
  pricePerNight?: number;
  imageThumbnail?: string;
}

// City coordinate lookup for accurate OpenStreetMap view
const CITY_COORDINATES: Record<string, { lat: number; lon: number; zoom: number }> = {
  "Aftab Nagar": { lat: 23.768, lon: 90.428, zoom: 15 },
  "Bashundhara R/A": { lat: 23.815, lon: 90.432, zoom: 15 },
  "Gulshan 2": { lat: 23.792, lon: 90.407, zoom: 15 },
  Dhanmondi: { lat: 23.746, lon: 90.375, zoom: 15 },
  Mohammadpur: { lat: 23.765, lon: 90.358, zoom: 15 },
  "Mirpur DOHS": { lat: 23.836, lon: 90.368, zoom: 15 },
  Banani: { lat: 23.793, lon: 90.405, zoom: 15 },
  Oia: { lat: 36.461, lon: 25.375, zoom: 14 },
  "Downtown Central": { lat: 13.736, lon: 100.56, zoom: 14 },
  "Kuala Lumpur": { lat: 3.149, lon: 101.713, zoom: 14 },
  "Saint-Émilion": { lat: 44.893, lon: -0.155, zoom: 13 },
};

export function ListingMapSection({
  location,
  listingTitle,
  pricePerNight,
  imageThumbnail,
}: ListingMapSectionProps) {
  const [zoomLevel, setZoomLevel] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<"standard" | "interactive">("interactive");

  const coords =
    CITY_COORDINATES[location.city] ||
    CITY_COORDINATES[location.neighborhood || ""] || {
      lat: 23.768,
      lon: 90.428,
      zoom: 15,
    };

  const fullLocationStr = [
    location.neighborhood,
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");

  // Bounding box for OpenStreetMap embed
  const delta = 0.015 / Math.pow(1.5, zoomLevel - 14);
  const bbox = `${coords.lon - delta},${coords.lat - delta},${coords.lon + delta},${coords.lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  const directMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLocationStr)}`;

  return (
    <div className="py-8 border-b border-neutral-200 dark:border-neutral-800 space-y-6">
      {/* Title & Location Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Neighborhood Explorer</span>
          </div>

          <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
            Where you&apos;ll be
          </h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-sans mt-1">
            {fullLocationStr}
          </p>
        </div>

        {/* External Google Maps Link */}
        <a
          href={directMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline transition self-start sm:self-auto"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Map Container */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#e5e3df] dark:bg-[#1a202c] shadow-lg transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-4 z-50 rounded-2xl shadow-2xl h-[calc(100vh-2rem)]"
            : "h-[400px] sm:h-[460px] md:h-[500px]"
        }`}
      >
        {/* Live Interactive OpenStreetMap Iframe */}
        <iframe
          title="Listing Location Map"
          src={osmEmbedUrl}
          className="w-full h-full border-0 filter contrast-[1.02] brightness-[0.98] dark:invert dark:hue-rotate-180 dark:contrast-[1.1]"
          loading="lazy"
        />

        {/* Top-Left Search Bar */}
        <div className="absolute top-4 left-4 z-20 w-64 sm:w-80">
          <div className="relative shadow-lg rounded-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find nearby cafes, transit, marts"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-500 shadow-md focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Floating Center Badge on Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
          {/* Pulsing Brand Radar Ring */}
          <div className="absolute w-24 h-24 rounded-full bg-brand-primary/20 animate-ping" />
          <div className="absolute w-32 h-32 rounded-full bg-brand-primary/10" />

          {/* Pin Card Pill with Home Icon & Price */}
          <div className="relative flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-full shadow-2xl ring-4 ring-white dark:ring-neutral-900 transform hover:scale-105 transition-transform pointer-events-auto cursor-pointer">
            <Home className="w-4 h-4 fill-white" />
            <span className="font-heading font-bold text-xs tracking-wide">
              {pricePerNight ? `$${pricePerNight}/night` : "Sanctuary"}
            </span>
          </div>

          {/* Privacy Tooltip */}
          <div className="mt-2 bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-xs flex items-center gap-1">
            <Shield className="w-3 h-3 text-brand-primary" />
            <span>Approximate area · Exact address after booking</span>
          </div>
        </div>

        {/* Right-Side Map Controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-10 h-10 rounded-xl bg-white/95 dark:bg-neutral-900/95 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer backdrop-blur-xs"
            aria-label="Toggle fullscreen"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-4 bottom-14 z-20 flex flex-col gap-1 shadow-lg rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 18))}
            className="w-10 h-10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full" />
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 11))}
            className="w-10 h-10 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Attribution Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xs px-3.5 py-1.5 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400 z-20 select-none">
          <div className="font-bold tracking-tight text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Travistay Live Map</span>
          </div>
          <div className="flex items-center gap-3">
            <span>© OpenStreetMap Contributors</span>
            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline"
            >
              Directions
            </a>
          </div>
        </div>
      </div>

      {/* Neighborhood Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-semibold text-xs text-neutral-900 dark:text-white">
              Public Transit
            </h5>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              4 min to Rampura Bridge · 10 min to Metro Rail Station
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-semibold text-xs text-neutral-900 dark:text-white">
              Dining &amp; Cafes
            </h5>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Bakeries, traditional tea stalls, and supermarkets right at Sector 2
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-semibold text-xs text-neutral-900 dark:text-white">
              Nearby Campus
            </h5>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              {location.distance || "5 min walk from East West University"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
