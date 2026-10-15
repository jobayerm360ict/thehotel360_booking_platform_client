import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Conversation } from "@/types";
import { refreshPrivateData, loadConversation, sendMessage, markAsRead, createOrGetConversation } from "../platformActions";
export { sendMessage, markAsRead, createOrGetConversation } from "../platformActions";
interface State { conversations: Conversation[]; activeGuestConversationId: string | null; activeHostConversationId: string | null; searchQuery: string }
const initialState: State = { conversations: [], activeGuestConversationId: null, activeHostConversationId: null, searchQuery: "" };
const upsert = (s: State, c: Conversation) => { const i = s.conversations.findIndex(x => x.id === c.id); if (i < 0) s.conversations.unshift(c); else s.conversations[i] = c; };
export const messagesSlice = createSlice({ name: "messages", initialState, reducers: {
  setActiveGuestConversation: (s, a: PayloadAction<string | null>) => { s.activeGuestConversationId = a.payload; },
  setActiveHostConversation: (s, a: PayloadAction<string | null>) => { s.activeHostConversationId = a.payload; },
  setSearchQuery: (s, a: PayloadAction<string>) => { s.searchQuery = a.payload; },
}, extraReducers: b => {
  b.addCase(refreshPrivateData.fulfilled, (s, a) => { s.conversations = a.payload.conversations.map(c => ({ ...c, messages: s.conversations.find(x => x.id === c.id)?.messages || [] })); });
  for (const action of [loadConversation, sendMessage, markAsRead]) b.addCase(action.fulfilled, (s, a) => { upsert(s, a.payload); });
  b.addCase(createOrGetConversation.fulfilled, (s, a) => { upsert(s, a.payload); s.activeGuestConversationId = a.payload.id; });
  b.addMatcher(a => ["auth/logout", "platform/resetPrivate"].includes(a.type), () => initialState);
} });
export const { setActiveGuestConversation, setActiveHostConversation, setSearchQuery } = messagesSlice.actions;
export default messagesSlice.reducer;
