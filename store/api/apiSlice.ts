/**
 * Base RTK Query API Slice
 * Features:
 * - Centralized fetchBaseQuery with JWT Bearer Token Injection
 * - Unified Cache Tag Management (Listings, Bookings, User, Conversations, etc.)
 * - Automatic Request Deduplication & Base URL Resolution
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { baseURL } from "@/constants/request";
import { toast } from "@/components/ui/sonner";
import { normalizeAssets } from "@/lib/normalizeAssets";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

let refreshPromise: Promise<{
  success: boolean;
  token: string;
  data?: unknown;
  refreshToken?: string;
} | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const urlStr = typeof args === "string" ? args : args.url;
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const { authService } = await import("@/services/authService");
          return await authService.refreshToken();
        } catch {
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const refreshResult = await refreshPromise;

    if (refreshResult?.token) {
      // Retry initial query with the fresh token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      try {
        const { authService } = await import("@/services/authService");
        authService.logout();
        const { store } = await import("@/store");
        const { logout } = await import("@/store/slices/authSlice");
        store.dispatch(logout());
      } catch {
        // Fallback
      }
    }
  }

  if (result.error && typeof window !== "undefined") {
    const errorData = result.error.data as
      | { message?: string; error?: string }
      | undefined;
    const msg = errorData?.message || errorData?.error;
    if (msg && result.error.status !== 401) {
      toast.error(msg, { id: msg });
    }
  }

  if (result.data !== undefined) result.data = normalizeAssets(result.data);
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Listings",
    "ListingDetail",
    "HostListings",
    "Categories",
    "Bookings",
    "BookingDetail",
    "HostReservations",
    "Conversations",
    "ConversationDetail",
  ],
  endpoints: () => ({}),
});
