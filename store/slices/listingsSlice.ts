import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Listing } from "@/types";
import { refreshListings, refreshPrivateData, loadListing, createListing, updateListing, deleteListing } from "../platformActions";
export { createListing, updateListing, deleteListing } from "../platformActions";
interface ListingsState { items: Listing[]; hostItems: Listing[]; selectedListing: Listing | null; status: "idle" | "loading" | "succeeded" | "failed"; error: string | null }
const initialState: ListingsState = { items: [], hostItems: [], selectedListing: null, status: "idle", error: null };
const upsert = (items: Listing[], listing: Listing) => { const index = items.findIndex(x => x.id === listing.id); if (index < 0) items.push(listing); else items[index] = listing; };
export const listingsSlice = createSlice({ name: "listings", initialState,
  reducers: { setSelectedListing: (s, a: PayloadAction<Listing | null>) => { s.selectedListing = a.payload; } },
  extraReducers: b => {
    b.addCase(refreshListings.pending, s => { s.status = "loading"; s.error = null; });
    b.addCase(refreshListings.fulfilled, (s, a) => { s.items = a.payload; s.status = "succeeded"; });
    b.addCase(refreshListings.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message || "Unable to load listings"; });
    b.addCase(refreshPrivateData.fulfilled, (s, a) => { s.hostItems = a.payload.listings; a.payload.favorites.forEach(x => upsert(s.items, x)); });
    b.addCase(loadListing.fulfilled, (s, a) => { upsert(s.items, a.payload); s.selectedListing = a.payload; });
    b.addCase(createListing.fulfilled, (s, a) => { upsert(s.hostItems, a.payload); upsert(s.items, a.payload); });
    b.addCase(updateListing.fulfilled, (s, a) => { upsert(s.hostItems, a.payload); upsert(s.items, a.payload); });
    b.addCase(deleteListing.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); s.hostItems = s.hostItems.filter(x => x.id !== a.payload); });
    b.addMatcher(a => ["auth/logout", "platform/resetPrivate"].includes(a.type), s => { s.hostItems = []; });
  },
});
export const { setSelectedListing } = listingsSlice.actions;
export default listingsSlice.reducer;
