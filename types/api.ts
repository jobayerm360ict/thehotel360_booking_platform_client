/**
 * Standard API Response and Error Interfaces
 * Production-ready standard envelope for all backend API interactions
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[] | string>;
  code?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined | string[];
}
