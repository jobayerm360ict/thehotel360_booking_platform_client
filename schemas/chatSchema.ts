import { z } from "zod";
import { UserRoleSchema } from "./authSchema";

export const ChatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderAvatar: z.string(),
  senderRole: UserRoleSchema,
  text: z.string().min(1, "Message cannot be empty"),
  timestamp: z.string(),
  createdAt: z.string(),
  read: z.boolean().default(false),
  quickAction: z
    .object({
      type: z.enum(["checkin_guide", "special_offer", "location_pin", "booking_confirm"]),
      title: z.string(),
      details: z.string().optional(),
    })
    .optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingTitle: z.string(),
  listingImage: z.string(),
  listingLocation: z.string(),
  listingPrice: z.number(),
  reservationId: z.string().optional(),
  guestId: z.string(),
  guestName: z.string(),
  guestAvatar: z.string(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  guestVerified: z.boolean().optional(),
  hostId: z.string(),
  hostName: z.string(),
  hostAvatar: z.string(),
  hostIsSuperhost: z.boolean().optional(),
  hostResponseTime: z.string().optional(),
  lastMessage: z.string(),
  lastMessageTime: z.string(),
  unreadCountForGuest: z.number().int().default(0),
  unreadCountForHost: z.number().int().default(0),
  status: z.enum(["inquiry", "confirmed", "completed", "cancelled"]).default("inquiry"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guestsCount: z.number().int().optional(),
  messages: z.array(ChatMessageSchema).default([]),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1, "Message cannot be empty"),
  quickAction: ChatMessageSchema.shape.quickAction,
});

export type ChatMessageType = z.infer<typeof ChatMessageSchema>;
export type ConversationType = z.infer<typeof ConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
