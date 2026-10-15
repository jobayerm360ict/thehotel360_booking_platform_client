import type { Middleware } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { toast } from "@/components/ui/sonner";
import { apiSlice } from "./api/apiSlice";
export const platformMiddleware: Middleware = api => {
  const owners = new Map<string, string>();
  return next => action => {
    const a = action as { type?: string; error?: { message?: string }; meta?: { requestId?: string; aborted?: boolean } };
    if (["auth/logout", "platform/resetPrivate"].includes(a.type || "")) api.dispatch(apiSlice.util.resetApiState());
    if (!a.type?.startsWith("platform/")) return next(action);
    const state = api.getState() as RootState;
    const owner = `${state.auth.user.id}:${state.auth.currentRole}:${state.auth.isAuthenticated}`;
    const isPublic = a.type.startsWith("platform/listings/") || a.type.startsWith("platform/detail/");
    if (!isPublic && a.meta?.requestId) {
      if (a.type.endsWith("/pending")) owners.set(a.meta.requestId, owner);
      else { const original = owners.get(a.meta.requestId); owners.delete(a.meta.requestId); if (original && original !== owner) return action; }
    }
    if (a.type.endsWith("/rejected") && !a.meta?.aborted && !a.type.startsWith("platform/private/") && !a.type.startsWith("platform/thread/"))
      toast.error(a.error?.message || "Request failed. Please retry.", { id: a.error?.message || "platform-error" });
    const result = next(action);
    if (a.type.endsWith("/fulfilled") && !["platform/listings", "platform/detail", "platform/private", "platform/thread", "platform/read"].some(prefix => a.type!.startsWith(prefix + "/")))
      api.dispatch(apiSlice.util.invalidateTags(["Listings", "ListingDetail", "Bookings", "HostReservations", "Conversations", "ConversationDetail"]));
    return result;
  };
};
