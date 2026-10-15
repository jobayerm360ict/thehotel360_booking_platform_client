/**
 * Booking and Reservation Domain Service
 */

import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/api";
import {
  ApiResponse,
  Reservation,
  CreateBookingDTO,
  QueryParams,
} from "@/types";

export const bookingService = {
  /**
   * Create a new reservation with payment selection
   */
  async createReservation(bookingData: CreateBookingDTO): Promise<Reservation> {
    const res = await apiClient.post<ApiResponse<Reservation> | Reservation>(
      API_ENDPOINTS.BOOKINGS.BASE,
      bookingData
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Fetch current user's guest trips
   */
  async getMyTrips(params?: QueryParams): Promise<Reservation[]> {
    const res = await apiClient.get<ApiResponse<Reservation[]> | Reservation[]>(
      API_ENDPOINTS.BOOKINGS.MY_TRIPS,
      { params }
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Fetch host incoming reservations
   */
  async getHostReservations(params?: QueryParams): Promise<Reservation[]> {
    const res = await apiClient.get<ApiResponse<Reservation[]> | Reservation[]>(
      API_ENDPOINTS.BOOKINGS.HOST_RESERVATIONS,
      { params }
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Get single reservation details
   */
  async getReservationById(id: string): Promise<Reservation> {
    const res = await apiClient.get<ApiResponse<Reservation> | Reservation>(
      API_ENDPOINTS.BOOKINGS.DETAIL(id)
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Cancel a reservation
   */
  async cancelReservation(
    id: string,
    reason?: string
  ): Promise<Reservation> {
    const res = await apiClient.post<ApiResponse<Reservation> | Reservation>(
      API_ENDPOINTS.BOOKINGS.CANCEL(id),
      { reason }
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Submit guest review for a completed stay
   */
  async submitReview(
    reservationId: string,
    review: { rating: number; comment: string }
  ): Promise<Reservation> {
    const res = await apiClient.post<ApiResponse<Reservation> | Reservation>(
      API_ENDPOINTS.BOOKINGS.SUBMIT_REVIEW(reservationId),
      review
    );
    return "data" in res ? res.data : res;
  },
};
