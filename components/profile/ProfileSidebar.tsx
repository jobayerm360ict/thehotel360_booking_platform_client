"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User as UserIcon,
  Heart,
  Bell,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Pencil,
  Layers,
  ChevronRight,
  Luggage,
  Star,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { switchRole, toggleUserRole, logout } from "@/store/slices/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toast } from "@/components/ui/sonner";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";

interface ProfileSidebarProps {
  onOpenAvatarModal?: () => void;
}

export function ProfileSidebar({ onOpenAvatarModal }: ProfileSidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { t, isBengali } = useTranslation();

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const { data: guestTrips } = usePlatformData(platformService.trips);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const conversations = useAppSelector((state) => state.messages.conversations);
  const allReviews = useAppSelector((state) => state.reviews?.items || []);
  const { data: notifications, reload: reloadNotifications } = usePlatformData(platformService.notifications);
  const unreadNotificationCount = (notifications || []).filter((item) => !item.read).length;

  useEffect(() => {
    const refreshNotifications = () => reloadNotifications();
    window.addEventListener("travistay:notifications-updated", refreshNotifications);
    return () => window.removeEventListener("travistay:notifications-updated", refreshNotifications);
  }, [reloadNotifications]);

  const guestReviewsCount = allReviews.filter(
    (r) =>
      r.targetUserId === currentUser.id ||
      r.authorId === currentUser.id ||
      r.targetUserName === currentUser.name ||
      r.authorName === currentUser.name,
  ).length;

  const guestUnreadCount = conversations
    .filter(
      (c) =>
        (currentUser.id && c.guestId === currentUser.id) ||
        (currentUser.email && c.guestEmail === currentUser.email),
    )
    .reduce((acc, c) => acc + c.unreadCountForGuest, 0);

  const userInitial = (() => {
    if (
      currentUser.name &&
      currentUser.name.toLowerCase() !== "guest user" &&
      currentUser.name.toLowerCase() !== "guest"
    ) {
      return currentUser.name[0];
    }
    if (
      currentUser.firstName &&
      currentUser.firstName.toLowerCase() !== "guest"
    ) {
      return currentUser.firstName[0];
    }
    if (currentUser.email) {
      return currentUser.email[0];
    }
    return "U";
  })().toUpperCase();

  const handleRoleSwitch = async () => {
    try {
      const res = await dispatch(toggleUserRole()).unwrap();
      const newRole =
        res?.data?.role || (currentRole === "guest" ? "host" : "guest");
      const msg =
        res?.message ||
        (newRole === "host"
          ? isBengali
            ? "হোস্ট মোডে পরিবর্তন সফল হয়েছে"
            : "Switched to Host Mode"
          : isBengali
            ? "গেস্ট মোডে পরিবর্তন সফল হয়েছে"
            : "Switched to Guest Mode");
      toast.success(msg);
      if (newRole === "host") {
        router.push("/host");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to switch role";
      toast.error(msg);
      dispatch(switchRole());
      if (currentRole === "guest") {
        router.push("/host");
      } else {
        router.push("/");
      }
    }
  };

  const navItems = [
    {
      href: "/profile",
      label: t("guest.profileTitle"),
      icon: UserIcon,
      exact: true,
    },
    {
      href: "/profile/bookings",
      label: t("guest.myBookings"),
      icon: Luggage,
      count: guestTrips?.length,
      matchPaths: ["/profile/bookings", "/trips"],
    },
    {
      href: "/profile/wishlist",
      label: t("guest.savedWishlist"),
      icon: Heart,
      count: favoriteIds.length,
      matchPaths: ["/profile/wishlist", "/wishlist"],
    },
    {
      href: "/profile/security",
      label: t("guest.securityLogin"),
      icon: ShieldCheck,
    },
    {
      href: "/profile/notifications",
      label: t("guest.notifications"),
      icon: Bell,
      badgeText: unreadNotificationCount > 0
        ? isBengali
          ? unreadNotificationCount + "টি নতুন"
          : unreadNotificationCount + " New"
        : undefined,
    },
    {
      href: "/profile/reviews",
      label: t("guest.reviews"),
      icon: Star,
      count: guestReviewsCount,
      matchPaths: ["/profile/reviews"],
    },
    {
      href: "/profile/messages",
      label: t("guest.hostMessages"),
      icon: MessageSquare,
      badgeText:
        guestUnreadCount > 0
          ? isBengali
            ? `${guestUnreadCount} নতুন`
            : `${guestUnreadCount} New`
          : undefined,
    },
  ];

  const normalizedPath = pathname.replace(/^\/(?:en|bn)/, "") || "/";

  const checkIsActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return normalizedPath === item.href || pathname === item.href;
    }
    return (
      normalizedPath === item.href ||
      normalizedPath.startsWith(`${item.href}/`) ||
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      Boolean(
        item.matchPaths?.some(
          (p) =>
            normalizedPath === p ||
            normalizedPath.startsWith(`${p}/`) ||
            pathname === p ||
            pathname.startsWith(`${p}/`),
        ),
      )
    );
  };

  return (
    <div className="space-y-2">
      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE NAVIGATION STRIP (VISIBLE ON MOBILE ONLY)           */}
      {/* ========================================================================= */}
      <div className="lg:hidden space-y-3">
        {/* Mobile Profile Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-brand-primary/20">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-brand-primary text-white font-heading font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              {onOpenAvatarModal && (
                <button
                  type="button"
                  onClick={onOpenAvatarModal}
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-brand-secondary text-white shadow-xs border-2 border-white dark:border-neutral-900 active:scale-90"
                  title="Change avatar"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white truncate">
                  {currentUser.name}
                </h3>
                {currentUser.identityVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-[11px] font-sans text-neutral-400 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRoleSwitch}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-sans font-semibold active:scale-95 transition"
          >
            {currentRole === "guest" ? "Host Portal" : "Guest View"}
          </button>
        </div>

        {/* Mobile Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = checkIsActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold whitespace-nowrap transition-all shrink-0 border ${
                  isActive
                    ? "bg-brand-primary text-white border-brand-primary shadow-xs font-bold"
                    : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP STICKY SIDEBAR (VISIBLE ON LG+ SCREENS)                       */}
      {/* ========================================================================= */}
      <div className="hidden lg:block space-y-4">
        {/* User Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="relative group">
              <Avatar className="w-14 h-14 ring-2 ring-brand-primary/20">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-brand-primary text-white font-heading font-bold text-xl">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              {onOpenAvatarModal && (
                <button
                  type="button"
                  onClick={onOpenAvatarModal}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-brand-secondary hover:bg-brand-secondary-hover text-white shadow-xs border-2 border-white dark:border-neutral-900 transition hover:scale-110 active:scale-95 cursor-pointer"
                  title="Change avatar"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-base text-neutral-900 dark:text-white truncate">
                  {currentUser.name}
                </h3>
                {currentUser.identityVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-xs font-sans text-neutral-400 truncate">
                {currentUser.email}
              </p>
              {currentUser.identityVerified && (
                <Badge className="mt-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-sans text-[10px] font-semibold border-emerald-200 px-2 py-0.5 rounded-full">
                  {t("guest.verifiedGuest")}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <Link
              href="/profile/bookings"
              className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-brand-primary transition"
            >
              <span className="font-heading font-bold text-lg text-neutral-900 dark:text-white block">
                {guestTrips ? guestTrips.length : "—"}
              </span>
              <span className="text-[10px] font-sans font-medium text-neutral-500">
                {t("guest.tripsBooked")}
              </span>
            </Link>
            <Link
              href="/profile/wishlist"
              className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-brand-primary transition"
            >
              <span className="font-heading font-bold text-lg text-brand-primary block">
                {favoriteIds.length}
              </span>
              <span className="text-[10px] font-sans font-medium text-neutral-500">
                {t("guest.savedStays")}
              </span>
            </Link>
          </div>

          {/* Switch Role Button */}
          <button
            type="button"
            onClick={handleRoleSwitch}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 dark:bg-neutral-800 text-brand-primary font-sans font-semibold text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>
                {currentRole === "guest"
                  ? t("guest.switchToHostPortal")
                  : t("host.switchToGuestView")}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation Links Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-secondary">
            {t("guest.profileTitle")}
          </div>
          {navItems.map((item) => {
            const isActive = checkIsActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-sans transition ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-400 group-hover:text-brand-primary"
                    }`}
                  />
                  <span className="font-normal">{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {item.badgeText && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-brand-primary/10 text-brand-primary"
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                router.push("/");
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("nav.signOut")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
