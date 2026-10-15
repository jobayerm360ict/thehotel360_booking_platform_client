/**
 * Authentication & User Service
 */

import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/api";
import { apiSlice } from "@/store/api/apiSlice";
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterDTO,
  UpdateProfileDTO,
  User,
  PayoutMethod,
  SendOtpDTO,
  MatchOtpDTO,
  OtpResponse,
  AuthApiResponse,
  ToggleRoleResponse,
  RawApiUser,
} from "@/types";

export const authService = {
  /**
   * Send OTP to email or phone number
   */
  async sendOtp(payload: SendOtpDTO): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>(
      API_ENDPOINTS.AUTH.SEND_EMAIL_OTP,
      payload,
      { skipAuth: true },
    );
    return ("data" in res && res.data && typeof res.data === "object" && "message" in res.data
      ? (res.data as OtpResponse)
      : res) as OtpResponse;
  },

  /**
   * Verify / Match OTP code
   */
  async matchOtp(payload: MatchOtpDTO): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>(
      API_ENDPOINTS.AUTH.MATCH_EMAIL_OTP,
      payload,
      { skipAuth: true },
    );
    return res;
  },

  /**
   * User login with email/password or OTP
   */
  async login(credentials: LoginCredentials): Promise<AuthApiResponse> {
    const res = await apiClient.post<AuthApiResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { skipAuth: true },
    );
    return res;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User> | User>(
      API_ENDPOINTS.AUTH.ME,
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Update profile information
   */
  async updateProfile(profileData: FormData | UpdateProfileDTO): Promise<User> {
    const res = await apiClient.patch<ApiResponse<User> | User>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      profileData,
    );
    try {
      const { store } = await import("@/store");
      store.dispatch(apiSlice.util.invalidateTags(["User"]));
    } catch {
      // In SSR or test contexts
    }
    return "data" in res ? res.data : res;
  },
  /**
   * Toggle user role between guest and host
   */
  async toggleRole(): Promise<ToggleRoleResponse> {
    const res = await apiClient.patch<ToggleRoleResponse>(
      API_ENDPOINTS.AUTH.TOGGLE_ROLE,
    );

    if (res?.token && typeof window !== "undefined") {
      localStorage.setItem("token", res.token);
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }
    }

    try {
      const { store } = await import("@/store");
      store.dispatch(apiSlice.util.invalidateTags(["User"]));
    } catch {
      // In SSR or test contexts
    }

    return res;
  },

  /**
   * Refresh authentication token using stored refresh token
   */
  async refreshToken(): Promise<{
    success: boolean;
    token: string;
    data?: User;
    refreshToken?: string;
  } | null> {
    const storedRefreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken")
        : null;

    if (!storedRefreshToken) {
      return null;
    }

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const result = await res.json();
      if (result?.token && typeof window !== "undefined") {
        localStorage.setItem("token", result.token);
        if (result.refreshToken) {
          localStorage.setItem("refreshToken", result.refreshToken);
        }
      }

      if (result?.data) {
        try {
          const { store } = await import("@/store");
          const { setUser } = await import("@/store/slices/authSlice");
          store.dispatch(setUser(result.data));
        } catch {
          // SSR or tests
        }
      }

      return result;
    } catch (e) {
      console.error("Token refresh failed:", e);
      return null;
    }
  },

  /**
   * Update host payout method
   */
  async updatePayoutMethod(payout: PayoutMethod): Promise<User> {
    const res = await apiClient.put<ApiResponse<User> | User>(
      API_ENDPOINTS.AUTH.UPDATE_PAYOUT,
      payout,
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Change the authenticated user's password.
   */
  async changePassword(payload: { old_password: string; new_password: string }): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload, { skipToast: true });
  },

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");
    }
  },
};
