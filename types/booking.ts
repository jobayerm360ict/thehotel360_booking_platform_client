/**
 * Booking, Reservation, Filter & Payment Domain Types
 */

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface FilterState {
  category: string;
  location: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: GuestCount;
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  superhostOnly: boolean;
  guestFavoriteOnly: boolean;
  searchQuery: string;
  userLocation?: { lat: number; lng: number } | null;
  isNearMeActive?: boolean;
}

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined";

export type PaymentPlanType = "full" | "partial";

export type PaymentMethodType =
  | "card"
  | "bkash"
  | "nagad"
  | "paypal"
  | "gpay"
  | "applepay";

export interface Reservation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  location: string;
  hostId: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  guestEmail: string;
  roomId?: string;
  roomName?: string;
  roomPrice?: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: GuestCount;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  specialRequests?: string;
  isReviewed?: boolean;
  reviewRating?: number;
  reviewComment?: string;
  paymentType?: PaymentPlanType;
  paidAmount?: number;
  remainingAmount?: number;
  paymentMethod?: PaymentMethodType | string;
}

export interface CreateBookingDTO {
  listingId: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  guests: GuestCount;
  paymentPlan: PaymentPlanType;
  paymentMethod: PaymentMethodType | string;
  specialRequests?: string;
}
