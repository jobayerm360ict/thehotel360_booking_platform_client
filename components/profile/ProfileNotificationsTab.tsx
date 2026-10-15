"use client";
import { useState } from "react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
export function ProfileNotificationsTab() {
  const { data, loading, error, reload } = usePlatformData(platformService.notifications);
  const [busy, setBusy] = useState(false);
  const markAll = async () => { if (busy) return; setBusy(true); try { await platformService.readNotifications(); reload(); window.dispatchEvent(new Event("travistay:notifications-updated")); } finally { setBusy(false); } };
  if (loading) return <div className="p-8">Loading notifications…</div>;
  if (error) return <div role="alert" className="p-8">{error}<button className="ml-3 underline" onClick={reload}>Retry</button></div>;
  const rows = data || [], unread = rows.filter(n => !n.read).length;
  return <section className="rounded-2xl border bg-white dark:bg-neutral-900 p-6 space-y-5"><div className="flex justify-between"><h2 className="text-xl font-semibold">Notifications ({unread} unread)</h2><button disabled={busy || !unread} onClick={() => void markAll().catch(() => undefined)} className="underline disabled:opacity-50">Mark all as read</button></div>
    {rows.map(n => <article key={n.id} className={`border rounded-xl p-4 ${n.read ? "" : "bg-brand-primary/5"}`}><h3 className="font-semibold">{n.title}</h3><p>{n.description}</p><time className="text-sm text-neutral-500">{new Date(n.time).toLocaleString()}</time></article>)}{!rows.length && <p>No notifications yet.</p>}
  </section>;
}
