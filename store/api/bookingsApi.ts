/**
 * Booking & Reservation Endpoints (RTK Query)
 */

import { apiSlice } from "./apiSlice";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Reservation,
  CreateBookingDTO,
  QueryParams,
  ApiResponse,
} from "@/types";

export const bookingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyTrips: builder.query<Reservation[], QueryParams | void>({
      query: (params) => ({
        url: API_ENDPOINTS.BOOKINGS.MY_TRIPS,
        params: params || undefined,
      }),
      transformResponse: (
        response: ApiResponse<Reservation[]> | Reservation[]
      ) => ("data" in response ? response.data : response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Bookings" as const, id })),
              { type: "Bookings", id: "MY_TRIPS" },
            ]
          : [{ type: "Bookings", id: "MY_TRIPS" }],
    }),

    getHostReservations: builder.query<Reservation[], QueryParams | void>({
      query: (params) => ({
        url: API_ENDPOINTS.BOOKINGS.HOST_RESERVATIONS,
        params: params || undefined,
      }),
      transformResponse: (
        response: ApiResponse<Reservation[]> | Reservation[]
      ) => ("data" in response ? response.data : response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "HostReservations" as const,
                id,
              })),
              { type: "HostReservations", id: "LIST" },
            ]
          : [{ type: "HostReservations", id: "LIST" }],
    }),

    getReservationById: builder.query<Reservation, string>({
      query: (id) => API_ENDPOINTS.BOOKINGS.DETAIL(id),
      transformResponse: (response: ApiResponse<Reservation> | Reservation) =>
        "data" in response ? response.data : response,
      providesTags: (_result, _error, id) => [{ type: "BookingDetail", id }],
    }),

    createBooking: builder.mutation<Reservation, CreateBookingDTO>({
      query: (bookingData) => ({
        url: API_ENDPOINTS.BOOKINGS.BASE,
        method: "POST",
        body: bookingData,
      }),
      transformResponse: (response: ApiResponse<Reservation> | Reservation) =>
        "data" in response ? response.data : response,
      invalidatesTags: [
        { type: "Bookings", id: "MY_TRIPS" },
        { type: "HostReservations", id: "LIST" },
      ],
    }),

    cancelReservation: builder.mutation<
      Reservation,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: API_ENDPOINTS.BOOKINGS.CANCEL(id),
        method: "POST",
        body: { reason },
      }),
      transformResponse: (response: ApiResponse<Reservation> | Reservation) =>
        "data" in response ? response.data : response,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "BookingDetail", id },
        { type: "Bookings", id: "MY_TRIPS" },
        { type: "HostReservations", id: "LIST" },
      ],
    }),

    submitReview: builder.mutation<
      Reservation,
      { reservationId: string; review: { rating: number; comment: string } }
    >({
      query: ({ reservationId, review }) => ({
        url: API_ENDPOINTS.BOOKINGS.SUBMIT_REVIEW(reservationId),
        method: "POST",
        body: review,
      }),
      transformResponse: (response: ApiResponse<Reservation> | Reservation) =>
        "data" in response ? response.data : response,
      invalidatesTags: (_result, _error, { reservationId }) => [
        { type: "BookingDetail", id: reservationId },
        { type: "Bookings", id: "MY_TRIPS" },
      ],
    }),
  }),
});

export const {
  useGetMyTripsQuery,
  useLazyGetMyTripsQuery,
  useGetHostReservationsQuery,
  useLazyGetHostReservationsQuery,
  useGetReservationByIdQuery,
  useCreateBookingMutation,
  useCancelReservationMutation,
  useSubmitReviewMutation,
} = bookingsApi;
