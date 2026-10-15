/**
 * Chat & Conversations Endpoints (RTK Query)
 */

import { apiSlice } from "./apiSlice";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Conversation,
  ChatMessage,
  SendMessageDTO,
  ApiResponse,
} from "@/types";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => API_ENDPOINTS.MESSAGES.CONVERSATIONS,
      transformResponse: (
        response: ApiResponse<Conversation[]> | Conversation[]
      ) => ("data" in response ? response.data : response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Conversations" as const,
                id,
              })),
              { type: "Conversations", id: "LIST" },
            ]
          : [{ type: "Conversations", id: "LIST" }],
    }),

    getConversationById: builder.query<Conversation, string>({
      query: (id) => API_ENDPOINTS.MESSAGES.CONVERSATION_DETAIL(id),
      transformResponse: (response: ApiResponse<Conversation> | Conversation) =>
        "data" in response ? response.data : response,
      providesTags: (_result, _error, id) => [{ type: "ConversationDetail", id }],
    }),

    sendMessage: builder.mutation<ChatMessage, SendMessageDTO>({
      query: (payload) => ({
        url: API_ENDPOINTS.MESSAGES.SEND,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<ChatMessage> | ChatMessage) =>
        "data" in response ? response.data : response,
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "ConversationDetail", id: conversationId },
        { type: "Conversations", id: "LIST" },
      ],
    }),

    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (conversationId) => ({
        url: API_ENDPOINTS.MESSAGES.MARK_READ(conversationId),
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, conversationId) => [
        { type: "ConversationDetail", id: conversationId },
        { type: "Conversations", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetConversationByIdQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} = chatApi;
