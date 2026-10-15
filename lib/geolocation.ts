import { MOCK_LISTINGS } from "@/data/mockListings";

/**
 * Calculate the great-circle distance between two points in kilometers
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in a user-friendly manner (meters or kilometers)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Reverse geocode latitude and longitude to a user-friendly city or place name.
 * Uses OpenStreetMap Nominatim with a fast timeout and falls back to nearest mock listing.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const primary =
          addr.suburb ||
          addr.neighbourhood ||
          addr.city_district ||
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality;
        const region = addr.city || addr.state || addr.country;
        if (primary && region && primary !== region) {
          return `${primary}, ${region}`;
        }
        if (primary) return primary;
        if (region) return region;
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: Check nearest known mock listing
  let nearestCity = "Current Location";
  let minDistance = Infinity;

  for (const item of MOCK_LISTINGS) {
    const itemLat = item.location.latitude;
    const itemLng = item.location.longitude;
    if (typeof itemLat === "number" && typeof itemLng === "number") {
      const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = item.location.city;
      }
    }
  }

  if (minDistance <= 60) {
    return nearestCity;
  }

  return "Current Location";
}

/**
 * Promisified browser geolocation getter with error handling
 */
export function getCurrentCoordinates(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = "Could not retrieve your location.";
        if (err.code === 1) {
          msg = "Location permission denied. Please allow location access.";
        } else if (err.code === 2) {
          msg = "Position unavailable. Please try again.";
        } else if (err.code === 3) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
