import { HotelRoom, Reservation } from "@/types";

/**
 * Checks whether two date ranges [start1, end1] and [start2, end2] overlap.
 * Assumes dates in 'YYYY-MM-DD' format.
 */
export function isDateRangeOverlapping(
  start1: string | null | undefined,
  end1: string | null | undefined,
  start2: string | null | undefined,
  end2: string | null | undefined
): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false;
  // Overlap condition: start1 < end2 && end1 > start2
  return start1 < end2 && end1 > start2;
}

export interface RoomAvailabilityResult {
  isAvailable: boolean;
  availableCount: number;
  totalQuantity: number;
  bookedCount: number;
  statusBadge: "available" | "limited" | "sold_out";
  statusText: string;
}

/**
 * Calculates real-time room availability for a given hotel room and date range.
 */
export function getRoomAvailability(
  room: HotelRoom,
  listingId: string,
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
  reservations: Reservation[] = []
): RoomAvailabilityResult {
  const totalQuantity = room.totalQuantity || 1;

  // If no dates selected, default to available with total quantity
  if (!checkIn || !checkOut) {
    return {
      isAvailable: true,
      availableCount: totalQuantity,
      totalQuantity,
      bookedCount: 0,
      statusBadge: "available",
      statusText: `${totalQuantity} Rooms in Hotel`,
    };
  }

  // Count active reservations for this room that overlap with selected dates
  const overlappingReservations = reservations.filter((res) => {
    if (res.status === "cancelled") return false;
    // Match listing and either room ID or hotel booking
    if (res.listingId !== listingId) return false;
    if (res.roomId && res.roomId !== room.id) return false;

    return isDateRangeOverlapping(res.checkIn, res.checkOut, checkIn, checkOut);
  });

  const bookedCount = overlappingReservations.length;
  const availableCount = Math.max(0, totalQuantity - bookedCount);
  const isAvailable = availableCount > 0;

  let statusBadge: "available" | "limited" | "sold_out" = "available";
  let statusText = "Available";

  if (!isAvailable) {
    statusBadge = "sold_out";
    statusText = "Sold Out for selected dates";
  } else if (availableCount === 1) {
    statusBadge = "limited";
    statusText = "Only 1 room left!";
  } else if (availableCount <= 2) {
    statusBadge = "limited";
    statusText = `Only ${availableCount} rooms left!`;
  } else {
    statusBadge = "available";
    statusText = `${availableCount} rooms available`;
  }

  return {
    isAvailable,
    availableCount,
    totalQuantity,
    bookedCount,
    statusBadge,
    statusText,
  };
}
