import { API_TIMEOUT, baseURL } from "@/constants/request";
import { ApiResponse, PaginatedResponse, ApiError } from "@/types/api";
import { toast } from "@/components/ui/sonner";
import { normalizeAssets } from "@/lib/normalizeAssets";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | string[]>;
  timeout?: number;
  skipAuth?: boolean;
  skipToast?: boolean;
  retried?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(url: string = baseURL) {
    this.baseURL = url.replace(/\/+$/, "");
  }

  private refreshPromise: Promise<boolean> | null = null;

  /**
   * Retrieve stored auth token from localStorage (or cookies in SSR context)
   */
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || sessionStorage.getItem("token");
    }
    return null;
  }

  /**
   * Helper to perform single-flight token refresh
   */
  private async refreshTokenHelper(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const storedRefreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken") ||
              sessionStorage.getItem("refreshToken")
            : null;

        if (!storedRefreshToken) return false;

        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        if (data?.token && typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Build URL with query params
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | string[]>,
  ): string {
    const url = new URL(
      endpoint.startsWith("http")
        ? endpoint
        : `${this.baseURL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`,
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Core request executor with timeout & error handling
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      headers = {},
      params,
      timeout = API_TIMEOUT,
      skipAuth = false,
    } = options;

    const fullUrl = this.buildUrl(endpoint, params);

    const defaultHeaders: Record<string, string> = {
      Accept: "application/json",
      ...headers,
    };

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (!isFormData && body !== undefined && method !== "GET") {
      defaultHeaders["Content-Type"] = "application/json";
    }

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: defaultHeaders,
        body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle empty response (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (
          response.status === 401 &&
          !skipAuth &&
          !options.retried &&
          !endpoint.includes("/refresh") &&
          !endpoint.includes("/login") &&
          !endpoint.includes("/otp")
        ) {
          const refreshed = await this.refreshTokenHelper();
          if (refreshed) {
            return this.request<T>(method, endpoint, body, {
              ...options,
              skipAuth: false,
              retried: true,
            });
          }
        }

        const error: ApiError = {
          message:
            responseData?.message ||
            responseData?.error ||
            `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          errors: responseData?.errors,
          code: responseData?.code,
        };

        if (
          typeof window !== "undefined" &&
          !options.skipToast &&
          response.status !== 401 &&
          error.message
        ) {
          toast.error(error.message, { id: error.message });
        }

        throw error;
      }

      return normalizeAssets(responseData) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if ((err as Error).name === "AbortError") {
        const timeoutError: ApiError = {
          message: `Request timed out after ${timeout}ms`,
          statusCode: 408,
          code: "TIMEOUT",
        };
        throw timeoutError;
      }

      if ((err as ApiError).statusCode) {
        throw err;
      }

      const networkError: ApiError = {
        message:
          (err as Error).message ||
          "Network error. Please check your internet connection.",
        statusCode: 0,
        code: "NETWORK_ERROR",
      };
      throw networkError;
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", endpoint, body, options);
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, body, options);
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, body, options);
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
