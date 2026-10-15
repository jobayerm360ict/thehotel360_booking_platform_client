/**
 * Chat and Conversation Domain Types
 */

import { UserRole } from "./auth";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
  quickAction?: {
    type: "checkin_guide" | "special_offer" | "location_pin" | "booking_confirm";
    title: string;
    details?: string;
  };
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingLocation: string;
  listingPrice: number;
  reservationId?: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  guestEmail?: string;
  guestPhone?: string;
  guestVerified?: boolean;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostIsSuperhost?: boolean;
  hostResponseTime?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountForGuest: number;
  unreadCountForHost: number;
  status: "inquiry" | "confirmed" | "completed" | "cancelled";
  checkIn?: string;
  checkOut?: string;
  guestsCount?: number;
  messages: ChatMessage[];
}

export interface SendMessageDTO {
  conversationId: string;
  text: string;
  quickAction?: ChatMessage["quickAction"];
}
