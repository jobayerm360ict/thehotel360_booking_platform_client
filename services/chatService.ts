/**
 * Chat and Messaging Domain Service
 */

import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/constants/api";
import {
  ApiResponse,
  Conversation,
  ChatMessage,
  SendMessageDTO,
} from "@/types";

export const chatService = {
  /**
   * Fetch all conversations for the user
   */
  async getConversations(): Promise<Conversation[]> {
    const res = await apiClient.get<ApiResponse<Conversation[]> | Conversation[]>(
      API_ENDPOINTS.MESSAGES.CONVERSATIONS
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Get single conversation thread with all messages
   */
  async getConversation(id: string): Promise<Conversation> {
    const res = await apiClient.get<ApiResponse<Conversation> | Conversation>(
      API_ENDPOINTS.MESSAGES.CONVERSATION_DETAIL(id)
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Send a chat message
   */
  async sendMessage(payload: SendMessageDTO): Promise<ChatMessage> {
    const res = await apiClient.post<ApiResponse<ChatMessage> | ChatMessage>(
      API_ENDPOINTS.MESSAGES.SEND,
      payload
    );
    return "data" in res ? res.data : res;
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    return apiClient.patch(API_ENDPOINTS.MESSAGES.MARK_READ(conversationId));
  },
};
