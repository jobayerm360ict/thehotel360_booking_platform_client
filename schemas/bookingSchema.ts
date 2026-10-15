import { z } from "zod";

export const GuestCountSchema = z.object({
  adults: z.number().int().min(1, "At least 1 adult required"),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  pets: z.number().int().min(0).default(0),
});

export const ReservationStatusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "declined",
]);

export const PaymentPlanSchema = z.enum(["full", "partial"]);

export const PaymentMethodSchema = z.enum([
  "card",
  "bkash",
  "nagad",
  "paypal",
  "gpay",
  "applepay",
]);

export const ReservationSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingTitle: z.string(),
  listingImage: z.string(),
  location: z.string(),
  hostId: z.string(),
  guestId: z.string(),
  guestName: z.string(),
  guestAvatar: z.string(),
  guestEmail: z.string().email(),
  roomId: z.string().optional(),
  roomName: z.string().optional(),
  roomPrice: z.number().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number().int().positive(),
  guests: GuestCountSchema,
  pricePerNight: z.number().positive(),
  cleaningFee: z.number().min(0),
  serviceFee: z.number().min(0),
  totalPrice: z.number().positive(),
  status: ReservationStatusSchema,
  createdAt: z.string(),
  specialRequests: z.string().optional(),
  isReviewed: z.boolean().optional(),
  reviewRating: z.number().min(1).max(5).optional(),
  reviewComment: z.string().optional(),
  paymentType: PaymentPlanSchema.optional(),
  paidAmount: z.number().optional(),
  remainingAmount: z.number().optional(),
  paymentMethod: z.string().optional(),
});

export const CreateBookingSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
  roomId: z.string().optional(),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: GuestCountSchema,
  paymentPlan: PaymentPlanSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
  specialRequests: z.string().optional(),
});

export type ReservationType = z.infer<typeof ReservationSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
