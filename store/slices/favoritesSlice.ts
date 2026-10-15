import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { refreshPrivateData, toggleFavorite } from "../platformActions";
export { toggleFavorite } from "../platformActions";
export const favoritesSlice = createSlice({ name: "favorites", initialState: { favoriteIds: [] as string[] },
  reducers: { setFavorites: (s, a: PayloadAction<string[]>) => { s.favoriteIds = a.payload; } },
  extraReducers: b => {
    b.addCase(refreshPrivateData.fulfilled, (s, a) => { s.favoriteIds = a.payload.favorites.map(x => x.id); });
    b.addCase(toggleFavorite.fulfilled, (s, a) => { s.favoriteIds = s.favoriteIds.filter(x => x !== a.payload.id); if (!a.payload.remove) s.favoriteIds.push(a.payload.id); });
    b.addMatcher(a => ["auth/logout", "platform/resetPrivate"].includes(a.type), s => { s.favoriteIds = []; });
  },
});
export const { setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
