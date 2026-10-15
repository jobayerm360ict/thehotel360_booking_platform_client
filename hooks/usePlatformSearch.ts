"use client";

import { useCallback, useEffect, useState } from "react";
import { platformService } from "@/services/platformService";
import type { FilterState, Listing } from "@/types";

export function usePlatformSearch(filter: FilterState) {
  const [result, setResult] = useState<{ key: string; listings: Listing[]; error: string }>({
    key: "", listings: [], error: "",
  });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  const params = JSON.stringify({
    category: filter.category || "all",
    search: filter.searchQuery || undefined,
    location: filter.isNearMeActive ? undefined : filter.location || undefined,
    minPrice: filter.priceRange[0],
    maxPrice: filter.priceRange[1],
    ...(filter.propertyTypes.length ? { propertyTypes: filter.propertyTypes.join(",") } : {}),
    ...(filter.amenities.length ? { amenities: filter.amenities.join(",") } : {}),
    ...(filter.checkIn && filter.checkOut ? { checkIn: filter.checkIn, checkOut: filter.checkOut } : {}),
    adults: filter.guests.adults,
    children: filter.guests.children,
    infants: filter.guests.infants,
    superhostOnly: filter.superhostOnly,
    guestFavoriteOnly: filter.guestFavoriteOnly,
  });
  const key = params + ":" + revision;
  useEffect(() => {
    let stopped = false;
    const timer = setTimeout(() => {
      platformService.listings(JSON.parse(params))
        .then((listings) => { if (!stopped) setResult({ key, listings, error: "" }); })
        .catch((error: unknown) => {
          if (!stopped) setResult({
            key, listings: [],
            error: error instanceof Error ? error.message : "Could not load available stays.",
          });
        });
    }, 250);
    return () => { stopped = true; clearTimeout(timer); };
  }, [params, key]);
  return {
    listings: result.key === key ? result.listings : [],
    loading: result.key !== key,
    error: result.key === key ? result.error : "",
    retry,
  };
}