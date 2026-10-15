"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  PlusCircle,
  MessageSquare,
  FileSpreadsheet,
  User as UserIcon,
  Award,
  ShieldCheck,
  ChevronRight,
  Eye,
  LogOut,
  Sparkles,
  TrendingUp,
  DollarSign,
  BedDouble,
  Star,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { switchRole, toggleUserRole, logout } from "@/store/slices/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";
import { toast } from "@/components/ui/sonner";
// import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function HostSidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { t, isBengali } = useTranslation();

  const user = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const allListings = useAppSelector((state) => state.listings.hostItems);
  const allReservations = useAppSelector((state) => state.booking.reservations);
  const conversations = useAppSelector((state) => state.messages.conversations);
  const roomTypes = useAppSelector((state) => state.roomTypes.items);
  const { data: hostMetrics } = usePlatformData(platformService.standards);
  const { data: hostReport } = usePlatformData(platformService.reports);

  // These API collections are scoped to the authenticated host.
  const hostedListings = allListings;
  const hostReservations = allReservations;
  const hostUnreadCount = conversations.reduce((count, conversation) => count + conversation.unreadCountForHost, 0);
  const totalRevenue = hostReport?.totalEarnings ?? 0;

  const userInitial = (() => {
    if (
      user.name &&
      user.name.toLowerCase() !== "guest user" &&
      user.name.toLowerCase() !== "guest"
    ) {
      return user.name[0];
    }
    if (user.firstName && user.firstName.toLowerCase() !== "guest") {
      return user.firstName[0];
    }
    if (user.email) {
      return user.email[0];
    }
    return "H";
  })().toUpperCase();

  const handleSwitchToGuest = async () => {
    try {
      const res = await dispatch(toggleUserRole()).unwrap();
      const msg =
        res?.message ||
        (isBengali
          ? "গেস্ট মোডে পরিবর্তন সফল হয়েছে"
          : "Switched to Guest Mode");
      toast.success(msg);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to switch role";
      toast.error(msg);
      dispatch(switchRole("guest"));
      router.push("/");
    }
  };

  const navItems = [
    {
      href: "/host",
      exact: true,
      label: isBengali ? "ড্যাশবোর্ড ও রিজার্ভেশন" : "Dashboard & Stays",
      icon: LayoutDashboard,
      count: hostReservations.length,
      badgeColor: "bg-brand-primary/10 text-brand-primary",
    },
    {
      href: "/host/messages",
      label: isBengali ? "অতিথিদের মেসেজ ও চ্যাট" : "Guest Inquiries & Chats",
      icon: MessageSquare,
      count: hostUnreadCount > 0 ? hostUnreadCount : undefined,
      badgeText:
        hostUnreadCount > 0
          ? isBengali
            ? `${hostUnreadCount} নতুন`
            : `${hostUnreadCount} New`
          : undefined,
      badgeColor: "bg-brand-primary text-white",
    },
    {
      href: "/host/listings",
      label: isBengali ? "আমার রিসোর্ট ও ভিলা" : "Hosted Sanctuaries",
      icon: Building2,
      count: hostedListings.length,
      badgeColor:
        "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
    },
    {
      href: "/host/room-types",
      label: isBengali ? "রুম ও লিস্টিং টাইপ" : "Room Types & Suites",
      icon: BedDouble,
      count: roomTypes.length,
      badgeColor: "bg-brand-primary/10 text-brand-primary",
    },
    {
      href: "/host/reports",
      label: isBengali ? "আয় ও অ্যানালিটিক্স" : "Financials & Reports",
      icon: FileSpreadsheet,
      badgeText: "CSV/PDF",
      badgeColor:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      href: "/host/profile",
      label: isBengali ? "প্রোফাইল ও ব্যাংক সেটিংস" : "Host Profile & Payout",
      icon: UserIcon,
      badgeText: isBengali ? "ব্যাংকিং" : "Banking",
      badgeColor: "bg-rose-50 text-brand-primary dark:bg-rose-950/40",
    },
    {
      href: "/host/reviews",
      label: isBengali ? "অতিথি রিভিউ ও রেটিং" : "Guest Reviews & Ratings",
      icon: Star,
      badgeText: hostMetrics && hostMetrics.reviewCount > 0 ? hostMetrics.rating.toFixed(2) + "★" : undefined,
      badgeColor:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      href: "/host/standards",
      label: isBengali ? "সুপারহোস্ট মানদণ্ড" : "Superhost Standards",
      icon: Award,
      badgeText: hostMetrics?.isSuperhost && hostMetrics.rating > 0 ? hostMetrics.rating.toFixed(2) + "★" : undefined,
      badgeColor:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const normalizedPath = pathname.replace(/^\/(?:en|bn)/, "") || "/";

  const checkIsActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return normalizedPath === item.href || pathname === item.href;
    }
    return (
      normalizedPath === item.href ||
      normalizedPath.startsWith(`${item.href}/`) ||
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
    );
  };

  return (
    <div className="space-y-2.5">
      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE NAVIGATION STRIP (VISIBLE ON MOBILE ONLY)           */}
      {/* ========================================================================= */}
      <div className="lg:hidden space-y-2">
        {/* Mobile Host Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-2.5 sm:p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 ring-2 ring-brand-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-brand-secondary text-white font-heading font-bold text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              {hostMetrics?.isSuperhost && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-secondary text-white text-[8px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900">★</span>}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                  {user.name}
                </h3>
                {hostMetrics?.isSuperhost && <Badge className="bg-brand-secondary text-white text-[8px] px-1 py-0 border-none font-sans hidden sm:inline-flex">Superhost</Badge>}
              </div>
              <p className="text-[10px] font-sans text-neutral-400 truncate">
                Host Command Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>Pages</span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  mobileMenuOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            <Link
              href="/host/create"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-sans font-semibold active:scale-95 transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List</span>
            </Link>
          </div>
        </div>

        {/* Expandable Mobile Navigation Grid */}
        {mobileMenuOpen && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
            {navItems.map((item) => {
              const isActive = checkIsActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-sans font-semibold transition ${
                    isActive
                      ? "bg-brand-primary text-white shadow-xs font-bold"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : item.badgeColor || "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs px-2">
              <button
                type="button"
                onClick={handleSwitchToGuest}
                className="text-brand-primary font-semibold hover:underline"
              >
                Switch to Guest View
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout());
                  router.push("/");
                }}
                className="text-neutral-400 hover:text-rose-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Mobile Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
      <div className="hidden lg:block space-y-3">
        {/* Host Identity Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="relative">
              <Avatar className="w-11 h-11 ring-2 ring-brand-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-brand-secondary text-white font-heading font-bold text-lg">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              {hostMetrics?.isSuperhost && <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-secondary text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-xs">★</span>}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white truncate">
                  {user.name}
                </h3>
                {user.identityVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-[11px] font-sans text-neutral-400 truncate">
                {user.email}
              </p>
              {hostMetrics?.isSuperhost && <Badge className="mt-0.5 bg-brand-secondary/10 text-brand-secondary dark:bg-amber-950/60 dark:text-amber-300 font-sans text-[9px] font-semibold border-none px-2 py-0.2 rounded-full">{t("host.certifiedSuperhost")}</Badge>}
            </div>
          </div>

          {/* Quick KPI Stats Pill */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 block truncate">
                {formatPrice(totalRevenue)}
              </span>
              <span className="text-[9px] font-sans font-medium text-neutral-500">
                {isBengali ? "মোট আয়" : "Total earnings"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-heading font-bold text-sm text-brand-primary block truncate">
                {hostReservations.length}
              </span>
              <span className="text-[9px] font-sans font-medium text-neutral-500">
                {t("host.reservations")}
              </span>
            </div>
          </div>

          {/* List New Sanctuary CTA */}
          <Link
            href="/host/create"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t("host.listNewSanctuary")}</span>
          </Link>
        </div>

        {/* Navigation Links Menu */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-2.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-0.5">
          <div className="px-3 py-2 text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-secondary">
            {t("host.suiteTitle")}
          </div>

          {navItems.map((item) => {
            const isActive = checkIsActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-sans font-normal transition ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs font-bold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-400 group-hover:text-brand-primary"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : item.badgeColor || "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {item.badgeText && !item.count && (
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : item.badgeColor ||
                          "bg-brand-primary/10 text-brand-primary"
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Theme Mode & Quick Switch to Guest Mode */}
          <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
            {/* <div className="flex items-center justify-between px-3 py-1.5 text-xs font-sans text-neutral-600 dark:text-neutral-400">
              <span className="font-medium">{isBengali ? "থিম মোড" : "Theme Mode"}</span>
              <ThemeToggle variant="dropdown" />
            </div> */}

            <button
              type="button"
              onClick={handleSwitchToGuest}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-neutral-400" />
                <span>{t("host.switchToGuestView")}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                router.push("/");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans font-semibold text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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
