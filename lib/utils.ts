import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "BDT"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDateRange(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && !checkOut) {
    const d = new Date(checkIn);
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - Add checkout`;
  }
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return `${d1.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${d2.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return "Add dates";
}

export function calculateNights(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export function formatGuestSummary(guests: { adults: number; children: number; infants: number; pets: number }): string {
  const totalGuests = guests.adults + guests.children;
  if (totalGuests === 0) return "Add guests";
  let str = `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`;
  if (guests.infants > 0) {
    str += `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}`;
  }
  if (guests.pets > 0) {
    str += `, ${guests.pets} pet${guests.pets > 1 ? "s" : ""}`;
  }
  return str;
}
