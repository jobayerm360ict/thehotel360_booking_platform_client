import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FilterState, GuestCount } from "@/types";

export const MAX_STAY_PRICE_BDT = 1_000_000;

const initialGuests: GuestCount = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
};

const initialState: FilterState = {
  category: "all",
  location: "",
  checkIn: null,
  checkOut: null,
  guests: initialGuests,
  priceRange: [0, MAX_STAY_PRICE_BDT],
  propertyTypes: [],
  amenities: [],
  superhostOnly: false,
  guestFavoriteOnly: false,
  searchQuery: "",
  userLocation: null,
  isNearMeActive: false,
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number } | null>
    ) => {
      state.userLocation = action.payload;
    },
    setIsNearMeActive: (state, action: PayloadAction<boolean>) => {
      state.isNearMeActive = action.payload;
    },
    setNearMeSearch: (
      state,
      action: PayloadAction<{
        location: string;
        coordinates: { lat: number; lng: number } | null;
      }>
    ) => {
      state.location = action.payload.location;
      state.userLocation = action.payload.coordinates;
      state.isNearMeActive = true;
    },
    setDates: (
      state,
      action: PayloadAction<{ checkIn: string | null; checkOut: string | null }>
    ) => {
      state.checkIn = action.payload.checkIn;
      state.checkOut = action.payload.checkOut;
    },
    setGuests: (state, action: PayloadAction<Partial<GuestCount>>) => {
      state.guests = { ...state.guests, ...action.payload };
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
    },
    togglePropertyType: (state, action: PayloadAction<string>) => {
      const type = action.payload;
      if (state.propertyTypes.includes(type)) {
        state.propertyTypes = state.propertyTypes.filter((t) => t !== type);
      } else {
        state.propertyTypes.push(type);
      }
    },
    toggleAmenity: (state, action: PayloadAction<string>) => {
      const amenity = action.payload;
      if (state.amenities.includes(amenity)) {
        state.amenities = state.amenities.filter((a) => a !== amenity);
      } else {
        state.amenities.push(amenity);
      }
    },
    setSuperhostOnly: (state, action: PayloadAction<boolean>) => {
      state.superhostOnly = action.payload;
    },
    setGuestFavoriteOnly: (state, action: PayloadAction<boolean>) => {
      state.guestFavoriteOnly = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetFilters: (state) => {
      return {
        ...initialState,
        category: state.category, // Keep active category on reset
      };
    },
  },
});

export const {
  setCategory,
  setLocation,
  setUserLocation,
  setIsNearMeActive,
  setNearMeSearch,
  setDates,
  setGuests,
  setPriceRange,
  togglePropertyType,
  toggleAmenity,
  setSuperhostOnly,
  setGuestFavoriteOnly,
  setSearchQuery,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
