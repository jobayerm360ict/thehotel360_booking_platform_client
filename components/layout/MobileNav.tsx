"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  Luggage,
  Building2,
  MessageSquare,
  User as UserIcon,
  Layers,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveSearchTab,
  setSearchExpanded,
  setAuthModalOpen,
} from "@/store/slices/uiSlice";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function MobileNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { t, isBengali } = useTranslation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const favoriteCount = useAppSelector(
    (state) => state.favorites.favoriteIds.length,
  );
  const reservationsCount = useAppSelector(
    (state) => state.booking.reservations.length,
  );
  const user = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const conversations = useAppSelector(
    (state) => state.messages.conversations,
  );

  const normalizedPath = pathname.replace(/^\/(?:en|bn)/, "") || "/";
  const isHostView = currentRole === "host" || normalizedPath.startsWith("/host");

  const unreadCount = isHostView
    ? conversations
        .filter(
          (c) =>
            c.hostId === user.id ||
            c.hostId === "user-host-1" ||
            user.hostedListingIds.includes(c.listingId),
        )
        .reduce((acc, c) => acc + c.unreadCountForHost, 0)
    : conversations
        .filter(
          (c) =>
            c.guestId === user.id ||
            c.guestId === "user-guest-1" ||
            c.guestEmail === user.email,
        )
        .reduce((acc, c) => acc + c.unreadCountForGuest, 0);

  if (
    normalizedPath.startsWith("/listings/") ||
    pathname.includes("/listings/") ||
    normalizedPath.startsWith("/book/") ||
    pathname.includes("/book/")
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 py-2 px-3">
      <div className="flex items-center justify-around">
        {!isAuthenticated ? (
          <>
            {/* Explore / Search Trigger */}
            <button
              type="button"
              onClick={() => {
                dispatch(setSearchExpanded(true));
                dispatch(setActiveSearchTab("where"));
              }}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition cursor-pointer ${
                pathname === "/"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Search className="w-5 h-5" />
              <span>{isBengali ? "অনুসন্ধান" : "Explore"}</span>
            </button>

            {/* Wishlists */}
            <Link
              href="/wishlist"
              className={`relative flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/wishlist"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
              <span>{isBengali ? "পছন্দ" : "Wishlists"}</span>
            </Link>

            {/* Sign In Trigger */}
            <button
              type="button"
              onClick={() => {
                dispatch(setAuthModalOpen({ open: true, tab: "login" }));
              }}
              className="flex flex-col items-center gap-1 text-[10px] font-semibold text-brand-primary transition cursor-pointer"
            >
              <UserIcon className="w-5 h-5" />
              <span>{t("nav.signIn")}</span>
            </button>
          </>
        ) : isHostView ? (
          <>
            {/* Host Dashboard */}
            <Link
              href="/host"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/host"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>{t("host.dashboard")}</span>
            </Link>

            {/* Host Listings */}
            <Link
              href="/host/listings"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/host/listings"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>{t("host.myListings")}</span>
            </Link>

            {/* Host Messages */}
            <Link
              href="/host/messages"
              className={`relative flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/host/messages"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span>{t("nav.messages")}</span>
            </Link>

            {/* Host Profile */}
            <Link
              href="/host/profile"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname.startsWith("/host/profile")
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>{isBengali ? "প্রোফাইল" : "Profile"}</span>
            </Link>
          </>
        ) : (
          <>
            {/* Explore / Search Trigger */}
            <button
              type="button"
              onClick={() => {
                dispatch(setSearchExpanded(true));
                dispatch(setActiveSearchTab("where"));
              }}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition cursor-pointer ${
                pathname === "/"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Search className="w-5 h-5" />
              <span>{isBengali ? "অনুসন্ধান" : "Explore"}</span>
            </button>

            {/* Wishlists */}
            <Link
              href="/profile/wishlist"
              className={`relative flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/profile/wishlist" || pathname === "/wishlist"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
              <span>{isBengali ? "পছন্দ" : "Wishlists"}</span>
            </Link>

            {/* Trips */}
            <Link
              href="/trips"
              className={`relative flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/trips"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <Luggage className="w-5 h-5" />
              {reservationsCount > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-brand-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {reservationsCount}
                </span>
              )}
              <span>{isBengali ? "ট্রিপস" : "Trips"}</span>
            </Link>

            {/* Messages */}
            <Link
              href="/profile/messages"
              className={`relative flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname.includes("messages")
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span>{t("nav.messages")}</span>
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                pathname === "/profile"
                  ? "text-brand-primary font-bold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>{isBengali ? "প্রোফাইল" : "Profile"}</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
