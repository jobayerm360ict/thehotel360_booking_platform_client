"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Listing } from "@/types";
import { formatPrice } from "@/lib/utils";
import {
  Loader2,
  Star,
  MapPin,
  ZoomIn,
  RotateCcw,
  Compass,
  LocateFixed,
} from "lucide-react";

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
  zoom: number;
}

interface SearchMapProps {
  items: Listing[];
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  hoveredId: string | null;
  selectedId: string | null;
  onHoverItem: (id: string | null) => void;
  onSelectItem: (id: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  searchOnMove: boolean;
  onToggleSearchOnMove: (checked: boolean) => void;
  onRetry?: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

// Controller subcomponent that listens to Leaflet map move events with 400ms debounce
function MapEventsHandler({
  onBoundsChange,
  searchOnMove,
}: {
  onBoundsChange: (bounds: MapBounds) => void;
  searchOnMove: boolean;
}) {
  const map = useMap();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBoundsKeyRef = useRef<string>("");

  const computeAndEmitBounds = useCallback(() => {
    const b = map.getBounds();
    const zoom = map.getZoom();
    const south = parseFloat(b.getSouth().toFixed(4));
    const west = parseFloat(b.getWest().toFixed(4));
    const north = parseFloat(b.getNorth().toFixed(4));
    const east = parseFloat(b.getEast().toFixed(4));

    const key = `${south}_${west}_${north}_${east}_${zoom}`;
    if (lastBoundsKeyRef.current === key) return;
    lastBoundsKeyRef.current = key;

    onBoundsChange({ south, west, north, east, zoom });
  }, [map, onBoundsChange]);

  // Initial bounds report on map mount
  useEffect(() => {
    computeAndEmitBounds();
  }, [computeAndEmitBounds]);

  useMapEvents({
    moveend: () => {
      if (!searchOnMove) return;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        computeAndEmitBounds();
      }, 400);
    },
  });

  return null;
}

// Fly to selected item when selectedId changes
function MapSelectionFlyer({
  items,
  selectedId,
}: {
  items: Listing[];
  selectedId: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const target = items.find((i) => i.id === selectedId);
    if (
      target &&
      typeof target.location.latitude === "number" &&
      typeof target.location.longitude === "number"
    ) {
      map.panTo([target.location.latitude, target.location.longitude], {
        animate: true,
        duration: 0.6,
      });
    }
  }, [selectedId, items, map]);

  return null;
}

// Fly to user's geolocation when active
function MapUserLocationFlyer({
  userLocation,
}: {
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const lastFlownCoordsRef = useRef<string>("");

  useEffect(() => {
    if (
      userLocation &&
      typeof userLocation.lat === "number" &&
      typeof userLocation.lng === "number"
    ) {
      const key = `${userLocation.lat.toFixed(4)}_${userLocation.lng.toFixed(4)}`;
      if (lastFlownCoordsRef.current !== key) {
        lastFlownCoordsRef.current = key;
        map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
      }
    }
  }, [userLocation?.lat, userLocation?.lng, map]);

  return null;
}

export function SearchMap({
  items,
  isFetching,
  isLoading,
  isError,
  hoveredId,
  selectedId,
  onHoverItem,
  onSelectItem,
  onBoundsChange,
  searchOnMove,
  onToggleSearchOnMove,
  onRetry,
  userLocation,
}: SearchMapProps) {
  // Retain previous markers while refetching so markers don't flicker
  const [displayedItems, setDisplayedItems] = useState<Listing[]>(items);

  useEffect(() => {
    if (items && items.length > 0) {
      setDisplayedItems((prev) => (prev === items ? prev : items));
    } else if (!isFetching && items && items.length === 0) {
      setDisplayedItems((prev) => (prev.length === 0 ? prev : []));
    }
  }, [items, isFetching]);

  // Memoize custom price pill icons to prevent unnecessary re-creations
  const iconCache = useRef<Map<string, L.DivIcon>>(new Map());

  const userMarkerIcon = useMemo(() => {
    return L.divIcon({
      className: "custom-user-location-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: #059669; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #059669; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, []);

  const getMarkerIcon = useCallback(
    (price: number, isHovered: boolean, isSelected: boolean) => {
      const stateKey = `${price}_${isHovered ? 1 : 0}_${isSelected ? 1 : 0}`;
      if (iconCache.current.has(stateKey)) {
        return iconCache.current.get(stateKey)!;
      }

      const activeClass = isSelected
        ? "map-price-pill-selected"
        : isHovered
        ? "map-price-pill-hovered"
        : "map-price-pill-default";

      const html = `<div class="map-price-pill ${activeClass}">$${price}</div>`;

      const icon = L.divIcon({
        className: "custom-map-pill-container",
        html,
        iconSize: [54, 26],
        iconAnchor: [27, 13],
      });

      iconCache.current.set(stateKey, icon);
      return icon;
    },
    []
  );

  // Default initial center: prioritizes user location if available, then first item, then Dhaka City [23.8103, 90.4125]
  const initialCenter: [number, number] = useMemo(() => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    const firstWithCoords = items.find(
      (i) =>
        typeof i.location.latitude === "number" &&
        typeof i.location.longitude === "number"
    );
    if (firstWithCoords) {
      return [
        firstWithCoords.location.latitude!,
        firstWithCoords.location.longitude!,
      ];
    }
    return [23.8103, 90.4125];
  }, [items, userLocation]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm bg-neutral-100 dark:bg-neutral-900 select-none touch-none">
      {/* 1. Top Controls Bar: 'Search as I move the map' centered pill & status */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-center justify-center gap-2 pointer-events-none">
        {/* 'Search as I move the map' Checkbox Pill */}
        <label className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg border border-neutral-200/90 dark:border-neutral-800 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer transition hover:bg-white active:scale-95">
          <input
            type="checkbox"
            checked={searchOnMove}
            onChange={(e) => onToggleSearchOnMove(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-brand-primary accent-brand-primary cursor-pointer"
          />
          <span className="whitespace-nowrap">Search as I move the map</span>
        </label>

        {/* Searching this area indicator while fetching */}
        {isFetching && (
          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 shadow-lg border border-neutral-200/90 dark:border-neutral-800 text-xs font-sans font-semibold text-brand-primary animate-fade-in">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
            <span className="whitespace-nowrap">Searching…</span>
          </div>
        )}
      </div>

      {/* 2. Leaflet Map Container with touch-action none & bottom-right zoom */}
      <MapContainer
        center={initialCenter}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-10 touch-none"
        style={{ height: "100%", width: "100%", touchAction: "none" }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapEventsHandler
          onBoundsChange={onBoundsChange}
          searchOnMove={searchOnMove}
        />

        <MapSelectionFlyer items={displayedItems} selectedId={selectedId} />
        <MapUserLocationFlyer userLocation={userLocation} />

        {/* User GPS location pulsing marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userMarkerIcon}
            zIndexOffset={2000}
          >
            <Popup className="custom-listing-popup" closeButton={false}>
              <div className="p-2 text-xs font-sans font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Your Current Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Render Price Pill Markers */}
        {displayedItems.map((listing) => {
          const lat = listing.location.latitude;
          const lng = listing.location.longitude;
          if (typeof lat !== "number" || typeof lng !== "number") return null;

          const isHovered = hoveredId === listing.id;
          const isSelected = selectedId === listing.id;

          const icon = getMarkerIcon(
            listing.pricePerNight,
            isHovered,
            isSelected
          );

          return (
            <Marker
              key={listing.id}
              position={[lat, lng]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : isHovered ? 500 : 0}
              eventHandlers={{
                mouseover: () => onHoverItem(listing.id),
                mouseout: () => onHoverItem(null),
                click: () => onSelectItem(listing.id),
              }}
            >
              <Popup className="custom-listing-popup" closeButton={false}>
                <div className="w-56 p-1 bg-white dark:bg-neutral-900 rounded-xl overflow-hidden font-sans text-neutral-900 dark:text-white space-y-1.5">
                  <div className="relative w-full h-28 rounded-lg overflow-hidden">
                    <Image
                      src={listing.images[0] || "/placeholder.jpg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{listing.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    <h4 className="font-heading font-bold text-xs truncate">
                      {listing.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-serif truncate">
                      {listing.location.city},{" "}
                      {listing.location.neighborhood || ""}
                    </p>
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                          {formatPrice(listing.pricePerNight)}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {" "}
                          / night
                        </span>
                      </div>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-[10px] font-bold text-brand-primary hover:underline"
                      >
                        View Stay →
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* 4. Empty State Floating Badge */}
      {!isFetching && displayedItems.length === 0 && !isLoading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl border border-neutral-200/90 dark:border-neutral-800 text-xs font-sans text-center space-y-1 animate-fade-in max-w-xs">
          <p className="font-bold text-neutral-800 dark:text-neutral-200">
            No stays found in this map view
          </p>
          <p className="text-[11px] text-neutral-500 font-serif">
            Zoom out or pan the map to search nearby areas.
          </p>
        </div>
      )}

      {/* 5. Error State Overlay */}
      {isError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 font-sans shadow-lg flex items-center gap-2">
          <span>Failed to load map stays.</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-bold underline cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Custom Styles for Price Pills */}
      <style jsx global>{`
        .custom-map-pill-container {
          background: transparent !important;
          border: none !important;
        }
        .map-price-pill {
          background-color: #ffffff;
          color: #171717;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-weight: 700;
          font-size: 11px;
          line-height: 1;
          padding: 6px 9px;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
          border: 1px solid rgba(0, 0, 0, 0.12);
          white-space: nowrap;
          text-align: center;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .map-price-pill:hover,
        .map-price-pill-hovered {
          background-color: #1a73e8 !important;
          color: #ffffff !important;
          transform: scale(1.14);
          box-shadow: 0 4px 14px rgba(26, 115, 232, 0.4) !important;
          border-color: #1a73e8 !important;
          z-index: 1000 !important;
        }
        .map-price-pill-selected {
          background-color: #0f172a !important;
          color: #ffffff !important;
          transform: scale(1.18);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
          border-color: #1a73e8 !important;
          outline: 2px solid #1a73e8 !important;
          z-index: 1001 !important;
        }
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 14px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
