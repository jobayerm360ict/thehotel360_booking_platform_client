import { createAsyncThunk } from "@reduxjs/toolkit";
import { platformService } from "@/services/platformService";
import type { RootState } from "./index";
import type { Listing, Reservation, UserReview, ChatMessage, UserRole, CreateListingDTO, CreateRoomTypeDTO } from "@/types";
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>;
  const keys = Object.keys(left); return keys.length === Object.keys(right).length && keys.every(k => same(left[k], right[k]));
}

export const refreshListings = createAsyncThunk("platform/listings", () => platformService.listings());
export const refreshPrivateData = createAsyncThunk("platform/private", async (_, api) => {
  const state = api.getState() as RootState, userId = state.auth.user.id, role = state.auth.currentRole;
  const [trips, favorites, reviews, conversations, rooms, listings] = await Promise.all([
    role === "host" ? platformService.reservations() : platformService.trips(), platformService.favorites(), platformService.reviews(),
    platformService.conversations(), role === "host" ? platformService.rooms() : Promise.resolve([]),
    role === "host" ? platformService.hostListings() : Promise.resolve([]),
  ]);
  if ((api.getState() as RootState).auth.user.id !== userId || (api.getState() as RootState).auth.currentRole !== role) return api.rejectWithValue("Account changed");
  return { trips, favorites, reviews, conversations, rooms, listings };
});
export const loadConversation = createAsyncThunk("platform/thread", (id: string) => platformService.conversation(id));
export const loadListing = createAsyncThunk("platform/detail", (id: string) => platformService.listing(id));
export const deleteListing = createAsyncThunk("platform/deleteListing", async (id: string) => { await platformService.deleteListing(id); return id; });
export const updateListing = createAsyncThunk("platform/updateListing", async (body: Listing, api) => {
  const { id, title, description, category, location, pricePerNight, images, specs, amenities, rules, cancellationPolicy } = body;
  const state = api.getState() as RootState, current = state.listings.hostItems.find(l => l.id === id) || state.listings.items.find(l => l.id === id);
  const changes = Object.fromEntries(Object.entries({ title, description, category, location, pricePerNight, images, specs, amenities, rules, cancellationPolicy })
    .filter(([key, value]) => value !== undefined && (!current || !same(value, (current as unknown as Record<string, unknown>)[key]))));
  return !Object.keys(changes).length && current ? current : platformService.updateListing(id, changes);
});
export const createListing = createAsyncThunk("platform/createListing", (body: CreateListingDTO) => platformService.createListing(body));
export const addRoomType = createAsyncThunk("platform/addRoom", (body: CreateRoomTypeDTO) => platformService.createRoom(body));
export const updateRoomType = createAsyncThunk("platform/updateRoom", async (body: CreateRoomTypeDTO & { id: number }, api) => {
  const { id, ...rest } = body, current = (api.getState() as RootState).roomTypes.items.find(r => r.id === id);
  const changes = Object.fromEntries(Object.entries(rest).filter(([key, value]) => value !== undefined && (!current || !same(value, (current as unknown as Record<string, unknown>)[key]))));
  return !Object.keys(changes).length && current ? current : platformService.updateRoom(id, changes);
});
export const deleteRoomType = createAsyncThunk("platform/deleteRoom", async (id: number) => { await platformService.deleteRoom(id); return id; });
export const cancelReservation = createAsyncThunk("platform/cancel", (id: string) => platformService.cancel(id));
export const completeReservation = createAsyncThunk("platform/complete", (id: string) => platformService.booking(id));
export const updateReservationStatus = createAsyncThunk("platform/status", ({ id, status }: { id: string; status: Reservation["status"] }) =>
  status === "cancelled" ? platformService.cancel(id) : platformService.status(id, status));
export const markReservationReviewed = createAsyncThunk("platform/guestReview", async (body: { reservationId: string; rating: number; comment: string; subRatings?: Record<string, number>; tags?: string[] }, api) => {
  const { reservationId, ...review } = body; await platformService.review(reservationId, review); const reservation = await platformService.booking(reservationId);
  api.dispatch(refreshPrivateData()); api.dispatch(loadListing(reservation.listingId)); return reservation;
});
export const addReview = createAsyncThunk("platform/hostReview", async (body: UserReview, api) => {
  if (!body.reservationId) throw new Error("Reservation ID required");
  await platformService.review(body.reservationId, { rating: body.rating, comment: body.comment, subRatings: body.subRatings, tags: body.tags }, true);
  await api.dispatch(refreshPrivateData());
});
export const replyToReview = createAsyncThunk("platform/reply", async ({ reviewId, comment }: { reviewId: string; comment: string }, api) => {
  await platformService.respond(reviewId, comment); await api.dispatch(refreshPrivateData());
});
export const toggleFavorite = createAsyncThunk("platform/favorite", async (id: string, api) => {
  const state = api.getState() as RootState; if (!state.auth.isAuthenticated) throw new Error("Please sign in to save favorites");
  const remove = state.favorites.favoriteIds.includes(id); await platformService.favorite(id, remove); return { id, remove };
});
export const sendMessage = createAsyncThunk("platform/send", async (body: { conversationId: string; text: string; quickAction?: ChatMessage["quickAction"]; senderId?: string; senderName?: string; senderAvatar?: string; senderRole?: UserRole }) => {
  await platformService.send(body.conversationId, body.text, body.quickAction); return platformService.conversation(body.conversationId);
});
export const markAsRead = createAsyncThunk("platform/read", async (body: { conversationId: string; role: UserRole }) => {
  await platformService.read(body.conversationId); return platformService.conversation(body.conversationId);
});
export const createOrGetConversation = createAsyncThunk("platform/startConversation", async (body: { listingId: string; initialMessage?: string; [key: string]: unknown }) => {
  const conversation = await platformService.startConversation(body.listingId);
  if (body.initialMessage) { await platformService.send(conversation.id, body.initialMessage); return platformService.conversation(conversation.id); }
  return conversation;
});
