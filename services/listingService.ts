/**
 * Listing and Property Domain Service
 */

import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/api";
import {
  ApiResponse,
  PaginatedResponse,
  Listing,
  CreateListingDTO,
  Category,
  Review,
  QueryParams,
} from "@/types";

export const listingService = {
  /**
   * Fetch listings with optional search & filter parameters
   */
  async getListings(params?: QueryParams): Promise<Listing[]> {
    const res = await apiClient.get<
      ApiResponse<Listing[]> | PaginatedResponse<Listing> | Listing[]
    >(API_ENDPOINTS.LISTINGS.BASE, { params });

    if (Array.isArray(res)) return res;
    return res.data;
  },

  /**
   * Fetch single listing by ID
   */
  async getListingById(id: string): Promise<Listing> {
    const res = await apiClient.get<ApiResponse<Listing> | Listing>(
      API_ENDPOINTS.LISTINGS.DETAIL(id)
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Fetch categories list
   */
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiResponse<Category[]> | Category[]>(
      API_ENDPOINTS.LISTINGS.CATEGORIES
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Fetch host listings
   */
  async getHostListings(): Promise<Listing[]> {
    const res = await apiClient.get<ApiResponse<Listing[]> | Listing[]>(
      API_ENDPOINTS.LISTINGS.HOST_LISTINGS
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Create a new property listing (Host only)
   */
  async createListing(listingData: CreateListingDTO): Promise<Listing> {
    const res = await apiClient.post<ApiResponse<Listing> | Listing>(
      API_ENDPOINTS.LISTINGS.BASE,
      listingData
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Update an existing listing
   */
  async updateListing(
    id: string,
    listingData: Partial<CreateListingDTO>
  ): Promise<Listing> {
    const res = await apiClient.patch<ApiResponse<Listing> | Listing>(
      API_ENDPOINTS.LISTINGS.DETAIL(id),
      listingData
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Delete a listing
   */
  async deleteListing(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(API_ENDPOINTS.LISTINGS.DETAIL(id));
  },

  /**
   * Get reviews for a listing
   */
  async getListingReviews(listingId: string): Promise<Review[]> {
    const res = await apiClient.get<ApiResponse<Review[]> | Review[]>(
      API_ENDPOINTS.LISTINGS.REVIEWS(listingId)
    );
    return "data" in res ? res.data : res;
  },
};
