"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { refreshListings, refreshPrivateData, loadConversation } from "./platformActions";
export function PlatformHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentRole, user } = useAppSelector(s => s.auth);
  const thread = useAppSelector(s => currentRole === "host" ? s.messages.activeHostConversationId : s.messages.activeGuestConversationId);
  const publicStatus = useAppSelector(s => s.listings.status);
  const [error, setError] = useState("");
  useEffect(() => { const task = dispatch(refreshListings()); return () => task.abort(); }, [dispatch]);
  useEffect(() => {
    dispatch({ type: "platform/resetPrivate" });
    if (!isAuthenticated || !user.id) return;
    let stopped = false, running = false;
    const reload = async () => {
      if (running || stopped) return;
      running = true;
      try { await dispatch(refreshPrivateData()).unwrap(); if (!stopped) setError(""); }
      catch { if (!stopped) setError("Could not load your account data. Check the backend connection and retry."); }
      finally { running = false; }
    };
    void reload(); const timer = setInterval(() => { if (document.visibilityState === "visible") void reload(); }, 30000);
    return () => { stopped = true; clearInterval(timer); };
  }, [isAuthenticated, user.id, currentRole, dispatch]);
  useEffect(() => {
    if (!isAuthenticated || !thread) return;
    const reload = () => dispatch(loadConversation(thread));
    const task = reload(); const timer = setInterval(() => { if (document.visibilityState === "visible") reload(); }, 5000);
    return () => { task.abort(); clearInterval(timer); };
  }, [isAuthenticated, thread, dispatch]);
  return <>{(publicStatus === "loading" || publicStatus === "failed" || error) && <div role="status" className="p-3 text-center text-sm bg-amber-50 text-amber-900">
    {publicStatus === "loading" ? "Loading stays…" : error || "Could not load stays from the server."}
    {publicStatus !== "loading" && <button className="ml-3 underline" onClick={() => { dispatch(refreshListings()); if (isAuthenticated) dispatch(refreshPrivateData()); }}>Retry</button>}
  </div>}{children}</>;
}
