import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RoomType } from "@/types";
import { refreshPrivateData, addRoomType, updateRoomType, deleteRoomType } from "../platformActions";
export { addRoomType, updateRoomType, deleteRoomType } from "../platformActions";
interface State { items: RoomType[]; selectedRoomType: RoomType | null; status: "idle" | "loading" | "succeeded" | "failed" }
const initialState: State = { items: [], selectedRoomType: null, status: "idle" };
export const roomTypesSlice = createSlice({ name: "roomTypes", initialState,
  reducers: { setSelectedRoomType: (s, a: PayloadAction<RoomType | null>) => { s.selectedRoomType = a.payload; } },
  extraReducers: b => {
    b.addCase(refreshPrivateData.fulfilled, (s, a) => { s.items = a.payload.rooms; s.status = "succeeded"; });
    b.addCase(addRoomType.fulfilled, (s, a) => { s.items.unshift(a.payload); });
    b.addCase(updateRoomType.fulfilled, (s, a) => { const i = s.items.findIndex(x => x.id === a.payload.id); if (i >= 0) s.items[i] = a.payload; });
    b.addCase(deleteRoomType.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); });
    b.addMatcher(a => ["auth/logout", "platform/resetPrivate"].includes(a.type), () => initialState);
  },
});
export const { setSelectedRoomType } = roomTypesSlice.actions;
export default roomTypesSlice.reducer;
