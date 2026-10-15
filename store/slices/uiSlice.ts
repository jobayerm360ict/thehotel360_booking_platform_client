import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isFilterModalOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup";
  quickViewListingId: string | null;
  isSearchExpanded: boolean;
  activeSearchTab: "where" | "checkIn" | "checkOut" | "who" | null;
  mobileMenuOpen: boolean;
}

const initialState: UiState = {
  isFilterModalOpen: false,
  isAuthModalOpen: false,
  authModalTab: "login",
  quickViewListingId: null,
  isSearchExpanded: false,
  activeSearchTab: null,
  mobileMenuOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFilterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterModalOpen = action.payload;
    },
    setAuthModalOpen: (
      state,
      action: PayloadAction<{ open: boolean; tab?: "login" | "signup" }>
    ) => {
      state.isAuthModalOpen = action.payload.open;
      if (action.payload.tab) {
        state.authModalTab = action.payload.tab;
      }
    },
    setQuickViewListingId: (state, action: PayloadAction<string | null>) => {
      state.quickViewListingId = action.payload;
    },
    setSearchExpanded: (state, action: PayloadAction<boolean>) => {
      state.isSearchExpanded = action.payload;
    },
    setActiveSearchTab: (
      state,
      action: PayloadAction<"where" | "checkIn" | "checkOut" | "who" | null>
    ) => {
      state.activeSearchTab = action.payload;
      if (action.payload) {
        state.isSearchExpanded = true;
      }
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
  },
});

export const {
  setFilterModalOpen,
  setAuthModalOpen,
  setQuickViewListingId,
  setSearchExpanded,
  setActiveSearchTab,
  setMobileMenuOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
