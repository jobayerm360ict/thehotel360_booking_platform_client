/**
 * Room Type Domain Types
 * Derived from the official ERD schema:
 * - room_types
 * - room_type_photos
 * - room_type_amenities
 * - amenities & amenities_head
 * - room_type_prices
 * - room_type_availability
 */

export type SpaceType = "entire_place" | "private_room" | "shared_room";

export type RoomTypeStatus = "active" | "inactive" | "draft";

export type AvailabilityStatus = "open" | "close";

export interface AmenityHead {
  id: number;
  name: string;
  icon: string;
  status: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Amenity {
  id: number;
  head_id: number;
  name: string;
  description?: string;
  icon?: string;
  order_number?: number;
  status: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  head?: AmenityHead;
}

export interface RoomTypeAmenity {
  id: number;
  room_type_id: number;
  amenity_id: number;
  created_at?: string;
  updated_at?: string;
  amenity?: Amenity;
}

export interface RoomTypePhoto {
  id: number;
  room_type_id?: number;
  url: string;
  created_at?: string;
}

export interface RoomTypePrice {
  id: number;
  unit_type_id: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomTypeAvailability {
  id: number;
  unit_type_id: number;
  date: string;
  total_inventory: number;
  reserved_quantity: number;
  blocked_quantity: number;
  held_quantity: number;
  available_quantity: number;
  status: AvailabilityStatus;
  created_at?: string;
  updated_at?: string;
}

export interface RoomType {
  id: number;
  listing_id?: number;
  space_type: SpaceType;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  max_adults: number;
  max_childrens: number;
  max_infants: number;
  bedroom_count: number;
  bed_count: number;
  bathroom_count: number;
  area: number; // in sq ft or sqm
  status: RoomTypeStatus | string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  // Associated entities
  photos?: RoomTypePhoto[];
  amenity_ids?: number[];
  amenities?: Amenity[];
  availability?: RoomTypeAvailability[];
  prices?: RoomTypePrice[];
}

export interface CreateRoomTypeDTO {
  listing_id?: number;
  space_type: SpaceType;
  name: string;
  slug?: string;
  description: string;
  base_price: number;
  max_adults: number;
  max_childrens: number;
  max_infants: number;
  bedroom_count: number;
  bed_count: number;
  bathroom_count: number;
  area: number;
  status?: RoomTypeStatus | string;
  photos?: (string | File | { url: string })[];
  amenity_ids?: number[];
  total_inventory?: number;
}

export interface UpdateRoomTypeDTO extends Partial<CreateRoomTypeDTO> {
  id: number;
}
