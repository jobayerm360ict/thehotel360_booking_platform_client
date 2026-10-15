import { Amenity, AmenityHead } from "@/types";

export const AMENITY_HEADS: AmenityHead[] = [
  { id: 1, name: "Bathroom", icon: "Bath", status: true, is_deleted: false },
  { id: 2, name: "Bedroom & Comfort", icon: "Bed", status: true, is_deleted: false },
  { id: 3, name: "Entertainment & Tech", icon: "Tv", status: true, is_deleted: false },
  { id: 4, name: "Climate & Cooling", icon: "Wind", status: true, is_deleted: false },
  { id: 5, name: "Kitchen & Refreshments", icon: "Coffee", status: true, is_deleted: false },
  { id: 6, name: "Scenic Views & Balcony", icon: "SunMedium", status: true, is_deleted: false },
  { id: 7, name: "Safety & Privacy", icon: "ShieldCheck", status: true, is_deleted: false },
];

export const INITIAL_AMENITIES: Amenity[] = [
  // Bathroom (Head 1)
  { id: 101, head_id: 1, name: "Private en-suite bathroom", icon: "Bath", status: true, is_deleted: false },
  { id: 102, head_id: 1, name: "Hot water shower", icon: "ShowerHead", status: true, is_deleted: false },
  { id: 103, head_id: 1, name: "Hair dryer", icon: "Wind", status: true, is_deleted: false },
  { id: 104, head_id: 1, name: "Luxury organic toiletries & towels", icon: "Sparkles", status: true, is_deleted: false },
  { id: 105, head_id: 1, name: "Soaking bathtub", icon: "Bath", status: true, is_deleted: false },

  // Bedroom & Comfort (Head 2)
  { id: 201, head_id: 2, name: "Plush King/Queen bed mattress", icon: "BedDouble", status: true, is_deleted: false },
  { id: 202, head_id: 2, name: "Extra pillows & goose-down blankets", icon: "Bed", status: true, is_deleted: false },
  { id: 203, head_id: 2, name: "Room-darkening blackout curtains", icon: "Moon", status: true, is_deleted: false },
  { id: 204, head_id: 2, name: "Wardrobe with wooden hangers", icon: "Archive", status: true, is_deleted: false },
  { id: 205, head_id: 2, name: "Iron & ironing board", icon: "Flame", status: true, is_deleted: false },

  // Entertainment & Tech (Head 3)
  { id: 301, head_id: 3, name: "Fast Wi-Fi (250+ Mbps)", icon: "Wifi", status: true, is_deleted: false },
  { id: 302, head_id: 3, name: "55\" 4K Smart TV with Netflix/Prime", icon: "Tv", status: true, is_deleted: false },
  { id: 303, head_id: 3, name: "Bluetooth soundbar audio system", icon: "Speaker", status: true, is_deleted: false },
  { id: 304, head_id: 3, name: "Dedicated ergonomic workspace", icon: "Laptop", status: true, is_deleted: false },

  // Climate (Head 4)
  { id: 401, head_id: 4, name: "Dual-inverter quiet Air conditioning", icon: "Snowflake", status: true, is_deleted: false },
  { id: 402, head_id: 4, name: "Central room heating", icon: "Flame", status: true, is_deleted: false },
  { id: 403, head_id: 4, name: "Whisper-quiet ceiling fan", icon: "Fan", status: true, is_deleted: false },

  // Kitchen & Refreshments (Head 5)
  { id: 501, head_id: 5, name: "Espresso coffee machine with pods", icon: "Coffee", status: true, is_deleted: false },
  { id: 502, head_id: 5, name: "Mini bar & beverage refrigerator", icon: "Refrigerator", status: true, is_deleted: false },
  { id: 503, head_id: 5, name: "Electric kettle & artisan tea selection", icon: "CupSoda", status: true, is_deleted: false },
  { id: 504, head_id: 5, name: "Complimentary bottled spring water", icon: "GlassWater", status: true, is_deleted: false },

  // Scenic Views (Head 6)
  { id: 601, head_id: 6, name: "Private open-air balcony / veranda", icon: "SunMedium", status: true, is_deleted: false },
  { id: 602, head_id: 6, name: "Panoramic mountain / sea horizon view", icon: "Mountain", status: true, is_deleted: false },
  { id: 603, head_id: 6, name: "Lush tropical garden / pool view", icon: "Trees", status: true, is_deleted: false },

  // Safety & Privacy (Head 7)
  { id: 701, head_id: 7, name: "Digital electronic in-room safe", icon: "KeyRound", status: true, is_deleted: false },
  { id: 702, head_id: 7, name: "Smart RFID / Keyless lock door", icon: "Lock", status: true, is_deleted: false },
  { id: 703, head_id: 7, name: "Smoke & Carbon monoxide alarm", icon: "ShieldAlert", status: true, is_deleted: false },
  { id: 704, head_id: 7, name: "First aid emergency kit", icon: "HeartPulse", status: true, is_deleted: false },
];
