import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Reservation, GuestCount } from "@/types";
import { refreshPrivateData, cancelReservation, completeReservation, updateReservationStatus, markReservationReviewed } from "../platformActions";
export { cancelReservation, completeReservation, updateReservationStatus, markReservationReviewed } from "../platformActions";
interface State { reservations: Reservation[]; currentBookingListingId: string | null; selectedCheckIn: string | null; selectedCheckOut: string | null; selectedGuests: GuestCount; recentBookingSuccess: Reservation | null }
const initialState: State = { reservations: [], currentBookingListingId: null, selectedCheckIn: null, selectedCheckOut: null,
  selectedGuests: { adults: 2, children: 0, infants: 0, pets: 0 }, recentBookingSuccess: null };
const upsert = (s: State, r: Reservation) => { const i = s.reservations.findIndex(x => x.id === r.id); if (i < 0) s.reservations.unshift(r); else s.reservations[i] = r; };
export const bookingSlice = createSlice({ name: "booking", initialState, reducers: {
  createReservation: (s, a: PayloadAction<Reservation>) => { upsert(s, a.payload); s.recentBookingSuccess = a.payload; },
  setCurrentBookingListing: (s, a: PayloadAction<string | null>) => { s.currentBookingListingId = a.payload; },
  setBookingDates: (s, a: PayloadAction<{ checkIn: string | null; checkOut: string | null }>) => { s.selectedCheckIn = a.payload.checkIn; s.selectedCheckOut = a.payload.checkOut; },
  setBookingGuests: (s, a: PayloadAction<Partial<GuestCount>>) => { s.selectedGuests = { ...s.selectedGuests, ...a.payload }; },
  clearBookingSuccess: s => { s.recentBookingSuccess = null; },
}, extraReducers: b => {
  b.addCase(refreshPrivateData.fulfilled, (s, a) => { s.reservations = a.payload.trips; });
  for (const action of [cancelReservation, completeReservation, updateReservationStatus, markReservationReviewed]) b.addCase(action.fulfilled, (s, a) => { upsert(s, a.payload); });
  b.addMatcher(a => ["auth/logout", "platform/resetPrivate"].includes(a.type), () => initialState);
} });
export const { createReservation, setCurrentBookingListing, setBookingDates, setBookingGuests, clearBookingSuccess } = bookingSlice.actions;
export default bookingSlice.reducer;
