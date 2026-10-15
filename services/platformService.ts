import { apiClient } from "./apiClient";
import type { ApiResponse, PaginatedResponse, Listing, CreateListingDTO, CreateRoomTypeDTO, RoomType, Reservation, CreateBookingDTO, Conversation, UserReview, QueryParams } from "@/types";

export async function allPages<T>(path: string, params: QueryParams = {}): Promise<T[]> {
  const result: T[] = [];
  for (let page = 1; ; page++) {
    const response = await apiClient.get<PaginatedResponse<T>>(path, { params: { ...params, page, limit: 100 } });
    result.push(...response.data);
    if (!response.meta?.hasNextPage) return result;
  }
}
export async function data<T>(promise: Promise<ApiResponse<T>>): Promise<T> { return (await promise).data; }
export interface Quote { nights: number; nightlyPrices: { date: string; price: number }[]; subtotal: number; cleaningFee: number; serviceFee: number; totalPrice: number; dueNow: number; currency: string }
export interface AvailabilityDay { date: string; available_quantity: number; price: number; total_inventory: number; reserved_quantity: number; held_quantity: number; blocked_quantity: number; status: string }
export interface RoomCalendar { roomId: string; dates: AvailabilityDay[] }
export interface PaymentIntent { paymentId: string; bookingId: string; amount: number; currency: string; checkoutUrl: string; status: string }
export interface Notification { id: string; type: string; title: string; description: string; time: string; read: boolean }
export interface HostMetrics { completedStays: number; rating: number; reviewCount: number; cancellationRate: number; responseRate: number | null; isSuperhost: boolean }
export interface LocalizedText { en: string; bn: string }
export interface HomeBenefit { id: string; title: LocalizedText; description: LocalizedText; icon: string; sortOrder: number }
export interface HomeSettings {
  benefitsHeading: LocalizedText;
  faqHeading: LocalizedText;
  faqDescription: LocalizedText;
  storiesHeading: LocalizedText;
  storiesDescription: LocalizedText;
  subscriptionHeading: LocalizedText;
  subscriptionDescription: LocalizedText;
}
export interface HomeContent { benefits: HomeBenefit[]; settings: HomeSettings }
export const platformService = {
  homeContent: () => data(apiClient.get<ApiResponse<HomeContent>>("/home-content", { skipAuth: true, skipToast: true })),
  subscribe: (email: string) => data(apiClient.post<ApiResponse<{ status: "accepted" }>>("/subscriptions", { email }, { skipAuth: true, skipToast: true })),
  blogs: () => data(apiClient.get<ApiResponse<import("@/data/blogs").BlogPost[]>>("/blogs")),
  faqs: () => data(apiClient.get<ApiResponse<import("@/data/faqs").FaqCategory[]>>("/faqs")),
  amenities: () => data(apiClient.get<ApiResponse<{ heads: import("@/types").AmenityHead[]; amenities: import("@/types").Amenity[] }>>("/amenities")),
  listings: (params?: QueryParams) => allPages<Listing>("/listings", params),
  hostListings: () => allPages<Listing>("/listings/host/my-listings"),
  availability: (id: string, checkIn: string, checkOut: string) => data(apiClient.get<ApiResponse<RoomCalendar[]>>("/listings/" + id + "/availability", { params: { checkIn, checkOut } })),
  listing: (id: string) => data(apiClient.get<ApiResponse<Listing>>(`/listings/${id}`)),
  createListing: (body: CreateListingDTO) => {
    const { title, description, category, location, pricePerNight, images, specs, amenities, rules, cancellationPolicy, tagline, mainCategory, subCategories } = body;
    return data(apiClient.post<ApiResponse<Listing>>("/listings", { title, description, category, location, pricePerNight, images, specs, amenities, rules, cancellationPolicy, tagline, mainCategory, subCategories }));
  },
  deleteListing: (id: string) => apiClient.delete(`/listings/${id}`),
  updateListing: (id: string, body: Partial<CreateListingDTO>) => data(apiClient.patch<ApiResponse<Listing>>(`/listings/${id}`, body)),
  rooms: () => allPages<RoomType>("/host/room-types"),
  createRoom: (body: CreateRoomTypeDTO) => data(apiClient.post<ApiResponse<RoomType>>("/host/room-types", body)),
  updateRoom: (id: number, body: Partial<CreateRoomTypeDTO>) => data(apiClient.patch<ApiResponse<RoomType>>(`/host/room-types/${id}`, body)),
  deleteRoom: (id: number) => apiClient.delete(`/host/room-types/${id}`),
  trips: () => allPages<Reservation>("/bookings/guest/my-trips"),
  reservations: () => allPages<Reservation>("/bookings/host/reservations"),
  createBooking: (body: CreateBookingDTO, key: string) => data(apiClient.post<ApiResponse<Reservation>>("/bookings", body, { headers: { "Idempotency-Key": key } })),
  quote: (body: CreateBookingDTO) => data(apiClient.post<ApiResponse<Quote>>("/bookings/quote", body, { skipToast: true })),
  booking: (id: string) => data(apiClient.get<ApiResponse<Reservation>>(`/bookings/${id}`)),
  cancel: (id: string) => data(apiClient.post<ApiResponse<Reservation>>(`/bookings/${id}/cancel`, {})),
  status: (id: string, status: string) => data(apiClient.patch<ApiResponse<Reservation>>(`/bookings/${id}/status`, { status })),
  review: (id: string, body: { rating: number; comment: string; subRatings?: Record<string, number>; tags?: string[] }, host = false) => apiClient.post(`/bookings/${id}/${host ? "review-guest" : "review"}`, body),
  reviews: () => allPages<UserReview>("/reviews"),
  respond: (id: string, comment: string) => apiClient.post(`/reviews/${id}/response`, { comment }),
  favorites: () => allPages<Listing>("/favorites"),
  favorite: (id: string, remove = false) => remove ? apiClient.delete(`/listings/${id}/favorite`) : apiClient.post(`/listings/${id}/favorite`),
  conversations: () => allPages<Conversation>("/messages/conversations"),
  conversation: (id: string) => data(apiClient.get<ApiResponse<Conversation>>(`/messages/conversations/${id}`)),
  startConversation: (listingId: string) => data(apiClient.post<ApiResponse<Conversation>>("/messages/conversations", { listingId })),
  send: (conversationId: string, text: string, quickAction?: Conversation["messages"][number]["quickAction"]) => apiClient.post("/messages/send", { conversationId, text, quickAction }),
  read: (id: string) => apiClient.patch(`/messages/conversations/${id}/read`),
  notifications: () => allPages<Notification>("/notifications"),
  readNotifications: () => apiClient.patch("/notifications/read-all"),
  payout: (body: unknown) => apiClient.patch("/host/payout-method", body),
  getPayout: () => data(apiClient.get<ApiResponse<{ payoutMethod: import("@/types").PayoutMethod | null; taxId: string; welcomeMessage: string }>>("/host/payout-method")),
  standards: () => data(apiClient.get<ApiResponse<HostMetrics>>("/host/standards")),
  reports: () => data(apiClient.get<ApiResponse<{ ledger: Reservation[]; payments: { id: string; bookingId: string; amount: number; status: string; createdAt: string }[]; payouts: unknown[]; totalEarnings: number }>>("/host/analytics/reports")),
  intent: (bookingId: string, customer: { name: string; email: string; phone: string; address: string; city: string }) => data(apiClient.post<ApiResponse<PaymentIntent>>("/bookings/payment/intent", { bookingId, customer })),
  confirm: (paymentId: string) => data(apiClient.post<ApiResponse<Reservation | { paymentStatus: string }>>("/bookings/payment/confirm", { paymentId })),
  async upload(files: File[]) {
    const body = new FormData(); files.forEach(file => body.append("images", file));
    return data(apiClient.post<ApiResponse<{ url: string; key: string }[]>>("/uploads/images", body));
  },
};
