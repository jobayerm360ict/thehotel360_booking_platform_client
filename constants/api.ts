/**
 * Central API Endpoints and Configuration Constants
 */

// 15 seconds

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/user/login",

    LOGOUT: "/auth/logout",
    SEND_EMAIL_OTP: "/common/send-email-otp",
    MATCH_EMAIL_OTP: "/common/match-email-otp",
    ME: "/auth/user/profile",
    REFRESH_TOKEN: "/auth/user/refresh",
    UPDATE_PROFILE: "/auth/user/profile",
    TOGGLE_ROLE: "/auth/user/toggle-user-role",
    UPDATE_PAYOUT: "/auth/payout-method",
    CHANGE_PASSWORD: "/auth/user/change-password",
  },
  LISTINGS: {
    BASE: "/listings",
    DETAIL: (id: string) => `/listings/${id}`,
    CATEGORIES: "/listings/categories",
    FEATURED: "/listings/featured",
    HOST_LISTINGS: "/listings/host/my-listings",
    SEARCH: "/listings/search",
    REVIEWS: (id: string) => `/listings/${id}/reviews`,
  },
  BOOKINGS: {
    BASE: "/bookings",
    DETAIL: (id: string) => `/bookings/${id}`,
    MY_TRIPS: "/bookings/guest/my-trips",
    HOST_RESERVATIONS: "/bookings/host/reservations",
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    PAYMENT_INTENT: "/bookings/payment/intent",
    CONFIRM_PAYMENT: "/bookings/payment/confirm",
    SUBMIT_REVIEW: (id: string) => `/bookings/${id}/review`,
  },
  MESSAGES: {
    CONVERSATIONS: "/messages/conversations",
    CONVERSATION_DETAIL: (id: string) => `/messages/conversations/${id}`,
    SEND: "/messages/send",
    MARK_READ: (conversationId: string) =>
      `/messages/conversations/${conversationId}/read`,
  },
  HOST: {
    STATS: "/host/analytics/stats",
    EARNINGS: "/host/analytics/earnings",
    REPORTS: "/host/analytics/reports",
  },
} as const;
