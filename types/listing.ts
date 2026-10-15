/**
 * Listing, Room, Host & Review Domain Types
 */

export type PropertyType =
  | "house"
  | "apartment"
  | "villa"
  | "cabin"
  | "cottage"
  | "treehouse"
  | "mansion"
  | "beachfront"
  | "hotel";

export interface Host {
  id: string;
  name: string;
  avatar: string;
  isSuperhost: boolean;
  joinedDate: string;
  responseRate: string;
  badge?: string;
  bio?: string;
}

export interface ListingSpecs {
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  propertyType: PropertyType;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface HotelRoom {
  id: string;
  name: string;
  type: "standard" | "deluxe" | "suite" | "presidential" | "family";
  pricePerNight: number;
  originalPrice?: number;
  totalQuantity: number;
  bedType: string;
  roomSize?: string;
  capacity: {
    adults: number;
    children: number;
  };
  amenities: string[];
  images: string[];
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
}

export interface ListingLocation {
  city: string;
  state?: string;
  country: string;
  neighborhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  tagline: string;
  category: string;
  location: ListingLocation;
  pricePerNight: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  host: Host;
  specs: ListingSpecs;
  amenities: string[];
  rules: string[];
  cancellationPolicy: string;
  isFeatured?: boolean;
  isGuestFavorite?: boolean;
  datesAvailable?: string;
  reviews?: Review[];
  createdAt?: string;
  mainCategory?: "apartments" | "rooms" | "hotels";
  subCategories?: string[];
  hotelRooms?: HotelRoom[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface CreateListingDTO {
  title: string;
  description: string;
  category: string;
  location: ListingLocation;
  pricePerNight: number;
  images: string[];
  specs: ListingSpecs;
  amenities: string[];
  rules?: string[];
  cancellationPolicy?: string;
  tagline?: string;
  mainCategory?: "apartments" | "rooms" | "hotels";
  subCategories?: string[];
}
