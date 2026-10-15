"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { switchRole, toggleUserRole } from "@/store/slices/authSlice";
import {
  Users,
  Building2,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  X,
  Luggage,
  Calendar,
  Loader2,
} from "lucide-react";

export function DemoPersonaSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const reservations = useAppSelector((state) => state.booking.reservations);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Count pending reservations for host preview
  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  const resolveDisplayName = (targetRole?: "guest" | "host") => {
    let fn = user?.firstName || "";
    if (fn.toLowerCase() === "guest") fn = "";
    if (
      !fn &&
      user?.name &&
      user.name.toLowerCase() !== "guest user" &&
      user.name.toLowerCase() !== "guest"
    ) {
      fn = user.name.split(" ")[0] || user.name;
    }
    if (!fn && user?.email) {
      fn = user.email.split("@")[0];
    }
    const roleForFallback = targetRole || currentRole;
    return fn || (roleForFallback === "host" ? "Host" : "Guest");
  };

  const handleToggle = async (targetRole?: "guest" | "host") => {
    if (targetRole && targetRole === currentRole) return;
    if (isToggling) return;
    setIsToggling(true);

    try {
      const result = await dispatch(toggleUserRole()).unwrap();
      const nextRole = (result?.data?.role === "host" ? "host" : "guest") as "guest" | "host";
      const displayName = resolveDisplayName(nextRole);
      const msg =
        nextRole === "host"
          ? `Switched to Host Mode (${displayName})`
          : `Switched to Guest Mode (${displayName})`;
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);

      // Contextual routing helper
      if (nextRole === "host" && !pathname.startsWith("/host")) {
        router.push("/host");
      } else if (nextRole === "guest" && pathname.startsWith("/host")) {
        router.push("/trips");
      }
    } catch {
      const nextRole = targetRole || (currentRole === "guest" ? "host" : "guest");
      dispatch(switchRole(nextRole));
    } finally {
      setIsToggling(false);
    }
  };

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Toast Notification for Persona Switch */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xl border border-neutral-800 dark:border-neutral-200 text-xs font-sans font-semibold">
            <Sparkles className="w-4 h-4 text-brand-primary shrink-0 animate-spin" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Demo Persona Dock (Bottom-Right, non-intrusive) */}
      <div
        className={`fixed ${
          pathname.includes("/listings/") ? "bottom-24" : "bottom-16 md:bottom-6"
        } md:bottom-6 right-4 sm:right-6 z-40`}
      >
        {!isExpanded ? (
          /* Minimized Floating Pill */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-brand-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
            title="Switch Persona Mode (Guest vs Host)"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-brand-primary/40 shrink-0">
              <Image
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                }
                alt={user?.name || "User"}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 text-left">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[11px] font-sans font-bold text-neutral-800 dark:text-neutral-200">
                {currentRole === "guest" ? "Guest Mode" : "Host Mode"}
              </span>
              <span className="text-[10px] font-sans text-neutral-400 font-normal hidden sm:inline">
                ({resolveDisplayName()})
              </span>
            </div>

            <ArrowRightLeft className="w-3.5 h-3.5 text-brand-primary group-hover:rotate-180 transition-transform duration-300" />
          </button>
        ) : (
          /* Expanded Persona Switcher Modal/Card */
          <div className="w-80 sm:w-88 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-neutral-900 dark:text-white">
                    Mode Switcher
                  </h4>
                  <p className="text-[10px] font-serif text-neutral-400">
                    Switch between Guest & Host view
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona Options Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Option 1: Guest Persona */}
              <button
                type="button"
                onClick={() => handleToggle("guest")}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  currentRole === "guest"
                    ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-1 ring-brand-primary/30"
                    : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 bg-neutral-50/50 dark:bg-neutral-800/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
                    👤
                  </span>
                  {currentRole === "guest" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-neutral-900 dark:text-white leading-tight">
                    Guest View
                  </div>
                  <div className="text-[10px] font-sans text-neutral-500 font-medium">
                    {user?.name || "Guest"}
                  </div>
                  <div className="text-[9px] font-serif text-neutral-400 mt-1">
                    Book & explore stays
                  </div>
                </div>
              </button>

              {/* Option 2: Host Persona */}
              <button
                type="button"
                onClick={() => handleToggle("host")}
                className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  currentRole === "host"
                    ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-1 ring-brand-primary/30"
                    : "border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 bg-neutral-50/50 dark:bg-neutral-800/40"
                }`}
              >
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                    {pendingCount} new
                  </span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
                    👑
                  </span>
                  {currentRole === "host" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-neutral-900 dark:text-white leading-tight">
                    Host View
                  </div>
                  <div className="text-[10px] font-sans text-neutral-500 font-medium">
                    {user?.name || "Host"}
                  </div>
                  <div className="text-[9px] font-serif text-neutral-400 mt-1">
                    Manage bookings & earnings
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Links for Active Persona */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-sans font-medium text-neutral-600 dark:text-neutral-300">
              {currentRole === "guest" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      router.push("/trips");
                    }}
                    className="flex items-center gap-1.5 hover:text-brand-primary transition cursor-pointer"
                  >
                    <Luggage className="w-3.5 h-3.5 text-brand-primary" />
                    <span>My Trips ({reservations.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      router.push("/");
                    }}
                    className="hover:text-brand-primary transition cursor-pointer text-[10px] text-neutral-400"
                  >
                    Explore Sanctuaries →
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      router.push("/host");
                    }}
                    className="flex items-center gap-1.5 hover:text-brand-primary transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Host Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      router.push("/host/create");
                    }}
                    className="hover:text-brand-primary transition cursor-pointer text-[10px] text-brand-primary font-semibold"
                  >
                    + New Listing
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
