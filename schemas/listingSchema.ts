import { z } from "zod";

export const PropertyTypeSchema = z.enum([
  "house",
  "apartment",
  "villa",
  "cabin",
  "cottage",
  "treehouse",
  "mansion",
  "beachfront",
  "hotel",
]);

export const HostSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  isSuperhost: z.boolean().default(false),
  joinedDate: z.string(),
  responseRate: z.string(),
  badge: z.string().optional(),
  bio: z.string().optional(),
});

export const ListingSpecsSchema = z.object({
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  beds: z.number().int().min(0),
  bathrooms: z.number().min(0),
  propertyType: PropertyTypeSchema,
});

export const ReviewSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  authorAvatar: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  comment: z.string(),
});

export const HotelRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["standard", "deluxe", "suite", "presidential", "family"]),
  pricePerNight: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  totalQuantity: z.number().int().positive(),
  bedType: z.string(),
  roomSize: z.string().optional(),
  capacity: z.object({
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
  }),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  breakfastIncluded: z.boolean().optional(),
  freeCancellation: z.boolean().optional(),
});

export const ListingLocationSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distance: z.string().optional(),
});

export const ListingSchema = z.object({
  id: z.string(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tagline: z.string(),
  category: z.string(),
  location: ListingLocationSchema,
  pricePerNight: z.number().positive("Price must be a positive number"),
  originalPrice: z.number().positive().optional(),
  rating: z.number().min(0).max(5).default(5),
  reviewCount: z.number().int().min(0).default(0),
  images: z.array(z.string()).min(1, "At least one image is required"),
  host: HostSchema,
  specs: ListingSpecsSchema,
  amenities: z.array(z.string()),
  rules: z.array(z.string()).default([]),
  cancellationPolicy: z.string(),
  isFeatured: z.boolean().optional(),
  isGuestFavorite: z.boolean().optional(),
  datesAvailable: z.string().optional(),
  reviews: z.array(ReviewSchema).optional(),
  createdAt: z.string().optional(),
  mainCategory: z.enum(["apartments", "rooms", "hotels"]).optional(),
  subCategories: z.array(z.string()).optional(),
  hotelRooms: z.array(HotelRoomSchema).optional(),
});

export const CreateListingSchema = ListingSchema.omit({
  id: true,
  rating: true,
  reviewCount: true,
  reviews: true,
  createdAt: true,
  host: true,
});

export type ListingType = z.infer<typeof ListingSchema>;
export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type HotelRoomType = z.infer<typeof HotelRoomSchema>;
