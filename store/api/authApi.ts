/**
 * Auth & User Endpoints (RTK Query)
 */

import { apiSlice } from "./apiSlice";
import { API_ENDPOINTS } from "@/constants/api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterDTO,
  UpdateProfileDTO,
  User,
  PayoutMethod,
  ApiResponse,
  SendOtpDTO,
  MatchOtpDTO,
  OtpResponse,
  ToggleRoleResponse,
  RawApiUser,
} from "@/types";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<OtpResponse, SendOtpDTO>({
      query: (payload) => ({
        url: API_ENDPOINTS.AUTH.SEND_EMAIL_OTP,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: OtpResponse) => response,
    }),

    matchOtp: builder.mutation<OtpResponse, MatchOtpDTO>({
      query: (payload) => ({
        url: API_ENDPOINTS.AUTH.MATCH_EMAIL_OTP,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: OtpResponse) => response,
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: "POST",
        body: credentials,
      }),
      transformResponse: (
        response: ApiResponse<AuthResponse> | AuthResponse,
      ) => ("data" in response ? response.data : response),
      invalidatesTags: ["User"],
    }),

    getMe: builder.query<User, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      transformResponse: (response: ApiResponse<User> | User) =>
        "data" in response ? response.data : response,
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, UpdateProfileDTO | FormData>({
      query: (profileData) => ({
        url: API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        method: "PATCH",
        body: profileData,
      }),
      transformResponse: (response: ApiResponse<User> | User) =>
        "data" in response ? response.data : response,
      invalidatesTags: ["User"],
    }),

    toggleRole: builder.mutation<ToggleRoleResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.TOGGLE_ROLE,
        method: "PATCH",
      }),
      transformResponse: (response: ToggleRoleResponse) => response,
      invalidatesTags: ["User"],
    }),

    updatePayoutMethod: builder.mutation<User, PayoutMethod>({
      query: (payout) => ({
        url: API_ENDPOINTS.AUTH.UPDATE_PAYOUT,
        method: "PUT",
        body: payout,
      }),
      transformResponse: (response: ApiResponse<User> | User) =>
        "data" in response ? response.data : response,
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation<
      { success: boolean; token: string; data?: User; refreshToken?: string },
      void
    >({
      query: () => ({
        url: "/api/auth/refresh",
        method: "POST",
      }),
      transformResponse: (response: {
        success: boolean;
        token: string;
        data?: User;
        refreshToken?: string;
      }) => response,
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: "POST",
      }),
      invalidatesTags: [
        "User",
        "Bookings",
        "HostReservations",
        "Conversations",
      ],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useMatchOtpMutation,
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useToggleRoleMutation,
  useRefreshTokenMutation,
  useUpdatePayoutMethodMutation,
  useLogoutMutation,
} = authApi;
