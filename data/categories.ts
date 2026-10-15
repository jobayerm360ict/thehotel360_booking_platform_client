import { Category } from "@/types";

export interface MainCategoryConfig {
  id: "apartments" | "rooms" | "hotels";
  label: string;
  icon: string;
  subCategories: {
    id: string;
    label: string;
    description?: string;
  }[];
}

export const MAIN_CATEGORIES: MainCategoryConfig[] = [
  {
    id: "apartments",
    label: "Apartments",
    icon: "🏡",
    subCategories: [
      { id: "new-arrivals", label: "New Arrivals", description: "Freshly listed modern apartments" },
      { id: "budget-stays", label: "Budget Stays", description: "Affordable full apartments" },
      { id: "family-stays", label: "Family Friendly Stays", description: "Spacious 2BR & 3BR apartments" },
      { id: "luxury-penthouses", label: "Luxury Penthouses", description: "High-floor luxury living" },
    ],
  },
  {
    id: "rooms",
    label: "Rooms",
    icon: "🛋️",
    subCategories: [
      { id: "new-arrivals", label: "New Arrivals", description: "Newly listed private rooms" },
      { id: "budget-stays", label: "Budget Stays", description: "Pocket-friendly cozy rooms" },
      { id: "ac-luxury", label: "AC Luxury Rooms", description: "Air-conditioned premium master rooms" },
      { id: "attached-bath", label: "Attached Bath & Balcony", description: "Rooms with private attached washroom" },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: "🏨",
    subCategories: [
      { id: "new-arrivals", label: "New Arrivals", description: "Latest boutique & business hotels" },
      { id: "budget-stays", label: "Budget Stays", description: "Great value hotel rooms" },
      { id: "luxury-suites", label: "Luxury Hotel Suites", description: "5-star suites & resort rooms" },
      { id: "city-center", label: "City Center Hotels", description: "Prime central downtown locations" },
    ],
  },
];

export const CATEGORIES: Category[] = [
  { id: "all", label: "All Homes", icon: "Flame", description: "Explore all top stays" },
  { id: "beachfront", label: "Beachfront", icon: "Palmtree", description: "Properties right on the water" },
  { id: "cabins", label: "Cabins", icon: "TreePine", description: "Cozy cabins in secluded nature" },
  { id: "mansions", label: "Mansions", icon: "Castle", description: "Grand estates and luxury villas" },
  { id: "amazing-views", label: "Amazing views", icon: "Mountain", description: "Homes with spectacular panoramas" },
  { id: "trending", label: "Trending", icon: "Sparkles", description: "Most popular places this week" },
  { id: "treehouses", label: "Treehouses", icon: "TreeDeciduous", description: "Stay above ground in the canopy" },
  { id: "lakefront", label: "Lakefront", icon: "Waves", description: "Serene lakeside getaways" },
  { id: "tiny-homes", label: "Tiny homes", icon: "Home", description: "Clever compact spaces" },
  { id: "countryside", label: "Countryside", icon: "Tractor", description: "Peaceful pastoral retreats" },
  { id: "luxe", label: "Luxe", icon: "Gem", description: "Extraordinary design and five-star service" },
  { id: "islands", label: "Islands", icon: "Sun", description: "Private island hideaways" },
  { id: "skiing", label: "Skiing", icon: "Snowflake", description: "Slopeside chalets and lodges" },
  { id: "caves", label: "Caves", icon: "Compass", description: "Unique underground dwellings" },
  { id: "pools", label: "Amazing pools", icon: "Ship", description: "Stunning infinity & private pools" },
];
