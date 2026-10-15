import { createSlice } from "@reduxjs/toolkit";
import type { UserReview } from "@/types";
import { refreshPrivateData } from "../platformActions";
export { addReview, replyToReview } from "../platformActions";
export const reviewsSlice = createSlice({ name: "reviews", initialState: { items: [] as UserReview[], isLoading: false, error: null as string | null }, reducers: {},
  extraReducers: b => {
    b.addCase(refreshPrivateData.fulfilled, (s, a) => { s.items = a.payload.reviews; s.isLoading = false; });
    b.addMatcher(a => ["auth/logout", "platform/resetPrivate"].includes(a.type), s => { s.items = []; });
  },
});
export default reviewsSlice.reducer;
