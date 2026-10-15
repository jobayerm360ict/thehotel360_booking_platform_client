/**
 * Listing Endpoints (RTK Query)
 */

import { apiSlice } from "./apiSlice";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Listing,
  CreateListingDTO,
  Category,
  Review,
  QueryParams,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const listingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<Listing[], QueryParams | void>({
      query: (params) => ({
        url: API_ENDPOINTS.LISTINGS.BASE,
        params: params || undefined,
      }),
      transformResponse: (
        response: ApiResponse<Listing[]> | PaginatedResponse<Listing> | Listing[]
      ) => {
        if (Array.isArray(response)) return response;
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Listings" as const, id })),
              { type: "Listings", id: "LIST" },
            ]
          : [{ type: "Listings", id: "LIST" }],
    }),

    getListingById: builder.query<Listing, string>({
      query: (id) => API_ENDPOINTS.LISTINGS.DETAIL(id),
      transformResponse: (response: ApiResponse<Listing> | Listing) =>
        "data" in response ? response.data : response,
      providesTags: (_result, _error, id) => [{ type: "ListingDetail", id }],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => API_ENDPOINTS.LISTINGS.CATEGORIES,
      transformResponse: (response: ApiResponse<Category[]> | Category[]) =>
        "data" in response ? response.data : response,
      providesTags: ["Categories"],
    }),

    getHostListings: builder.query<Listing[], void>({
      query: () => API_ENDPOINTS.LISTINGS.HOST_LISTINGS,
      transformResponse: (response: ApiResponse<Listing[]> | Listing[]) =>
        "data" in response ? response.data : response,
      providesTags: ["HostListings"],
    }),

    createListing: builder.mutation<Listing, CreateListingDTO>({
      query: (listingData) => ({
        url: API_ENDPOINTS.LISTINGS.BASE,
        method: "POST",
        body: listingData,
      }),
      transformResponse: (response: ApiResponse<Listing> | Listing) =>
        "data" in response ? response.data : response,
      invalidatesTags: [{ type: "Listings", id: "LIST" }, "HostListings"],
    }),

    updateListing: builder.mutation<
      Listing,
      { id: string; data: Partial<CreateListingDTO> }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.LISTINGS.DETAIL(id),
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Listing> | Listing) =>
        "data" in response ? response.data : response,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ListingDetail", id },
        { type: "Listings", id: "LIST" },
        "HostListings",
      ],
    }),

    deleteListing: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.LISTINGS.DETAIL(id),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Listings", id: "LIST" }, "HostListings"],
    }),

    getListingReviews: builder.query<Review[], string>({
      query: (id) => API_ENDPOINTS.LISTINGS.REVIEWS(id),
      transformResponse: (response: ApiResponse<Review[]> | Review[]) =>
        "data" in response ? response.data : response,
    }),

    getHotelsByMap: builder.query<
      Listing[],
      { south: number; west: number; north: number; east: number; zoom: number }
    >({
      query: ({ south, west, north, east, zoom }) => ({
        url: `/hotels/map?south=${south.toFixed(4)}&west=${west.toFixed(4)}&north=${north.toFixed(4)}&east=${east.toFixed(4)}&zoom=${zoom}`,
      }),
      transformResponse: (response: ApiResponse<Listing[]> | Listing[]) => {
        if (Array.isArray(response)) return response;
        if (response && "data" in response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Listings" as const, id })),
              { type: "Listings", id: "MAP" },
            ]
          : [{ type: "Listings", id: "MAP" }],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useLazyGetListingsQuery,
  useGetListingByIdQuery,
  useGetCategoriesQuery,
  useGetHostListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useGetListingReviewsQuery,
  useGetHotelsByMapQuery,
} = listingsApi;
