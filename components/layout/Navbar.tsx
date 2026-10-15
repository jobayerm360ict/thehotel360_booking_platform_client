"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiLoginCircleLine } from "react-icons/ri";
import {
  Search,
  User as UserIcon,
  Heart,
  Compass,
  Luggage,
  SlidersHorizontal,
  Building2,
  PlusCircle,
  Layers,
  BookOpen,
  FileSpreadsheet,
  Calendar,
  MessageSquare,
  Globe,
  HelpCircle,
  Menu,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAuthModalOpen,
  setFilterModalOpen,
  setActiveSearchTab,
  setSearchExpanded,
} from "@/store/slices/uiSlice";
import { switchRole, toggleUserRole, logout } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
import { formatGuestSummary, formatDateRange } from "@/lib/utils";
import { SearchExpandedBar } from "@/components/search/SearchExpandedBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t, isBengali, language, setLanguage } = useTranslation();

  const filter = useAppSelector((state) => state.filter);
  const favoriteIds = useAppSelector((state) => state.favorites.favoriteIds);
  const reservations = useAppSelector((state) => state.booking.reservations);
  const isSearchExpanded = useAppSelector((state) => state.ui.isSearchExpanded);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const currentRole = useAppSelector((state) => state.auth.currentRole);
  const conversations = useAppSelector((state) => state.messages.conversations);

  const hostUnreadCount = conversations
    .filter(
      (c) =>
        (currentUser?.id && c.hostId === currentUser.id) ||
        currentUser?.hostedListingIds?.includes(c.listingId) ||
        currentRole === "host",
    )
    .reduce((acc, c) => acc + c.unreadCountForHost, 0);

  const guestUnreadCount = conversations
    .filter(
      (c) =>
        (currentUser?.id && c.guestId === currentUser.id) ||
        (currentUser?.email && c.guestEmail === currentUser.email),
    )
    .reduce((acc, c) => acc + c.unreadCountForGuest, 0);

  const userDisplayName = (() => {
    let fn = currentUser?.firstName || "";
    if (fn.toLowerCase() === "guest") fn = "";
    if (
      !fn &&
      currentUser?.name &&
      currentUser.name.toLowerCase() !== "guest user" &&
      currentUser.name.toLowerCase() !== "guest"
    ) {
      fn = currentUser.name.split(" ")[0] || currentUser.name;
    }
    if (!fn && currentUser?.email) {
      fn = currentUser.email.split("@")[0];
    }
    return (
      fn ||
      (currentRole === "host"
        ? isBengali
          ? "হোস্ট"
          : "Host"
        : isBengali
          ? "গেস্ট"
          : "Guest")
    );
  })();

  const userInitial = (() => {
    if (
      currentUser?.name &&
      currentUser.name.toLowerCase() !== "guest user" &&
      currentUser.name.toLowerCase() !== "guest"
    ) {
      return currentUser.name[0];
    }
    if (
      currentUser?.firstName &&
      currentUser.firstName.toLowerCase() !== "guest"
    ) {
      return currentUser.firstName[0];
    }
    if (currentUser?.email) {
      return currentUser.email[0];
    }
    return "U";
  })().toUpperCase();

  const hasActiveFilters =
    Boolean(filter.location) ||
    Boolean(filter.checkIn) ||
    filter.guests.adults > 1 ||
    filter.propertyTypes.length > 0 ||
    filter.amenities.length > 0 ||
    filter.superhostOnly;

  const [isTogglingRole, setIsTogglingRole] = React.useState(false);

  const handleToggleRole = async () => {
    if (isTogglingRole) return;
    setIsTogglingRole(true);
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
      toast.success(msg, { id: "toggle-role" });
      if (newRole === "host") {
        router.push("/host");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : isBengali
              ? "রোল পরিবর্তন করা যায়নি"
              : "Failed to switch role";
      toast.error(errorMsg, { id: "toggle-role-err" });
      const nextRole = currentRole === "guest" ? "host" : "guest";
      dispatch(switchRole(nextRole));
      if (nextRole === "host") {
        router.push("/host");
      } else {
        router.push("/");
      }
    } finally {
      setIsTogglingRole(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-neutral-200/70 transition-all duration-300 dark:bg-neutral-900/95 dark:border-neutral-800">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <Image src="/logoFD.png" alt="Logo" width={200} height={40} />
          </Link>

          {/* Compact Pill Search Bar */}
          {!isSearchExpanded ? (
            <div
              onClick={() => dispatch(setActiveSearchTab("where"))}
              className="hidden md:flex items-center divide-x divide-neutral-200 border border-neutral-200/90 rounded-full py-2.5 px-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:border-neutral-300 dark:border-neutral-700 dark:divide-neutral-700 bg-white/80 dark:bg-neutral-800/80"
            >
              <button className="font-serif text-sm font-medium px-4 text-neutral-800 dark:text-neutral-200 truncate max-w-[140px] cursor-pointer">
                {filter.location || t("nav.anyDestination")}
              </button>
              <button className="font-serif text-sm font-medium px-4 text-neutral-800 dark:text-neutral-200 truncate max-w-[140px] cursor-pointer">
                {filter.checkIn
                  ? formatDateRange(filter.checkIn, filter.checkOut)
                  : t("nav.pickDates")}
              </button>
              <div className="flex items-center gap-3 pl-4">
                <span className="font-serif text-sm text-neutral-500 dark:text-neutral-400 font-normal truncate max-w-[120px]">
                  {filter.guests.adults > 1 || filter.guests.children > 0
                    ? formatGuestSummary(filter.guests)
                    : t("nav.addGuests")}
                </span>
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-xs">
                  <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-8 font-heading text-sm font-medium text-neutral-600 dark:text-neutral-300">
              <button
                onClick={() => dispatch(setActiveSearchTab("where"))}
                className="hover:text-brand-primary transition pb-1 border-b-2 border-brand-primary text-brand-primary font-semibold cursor-pointer"
              >
                {t("nav.curatedSanctuaries")}
              </button>
              <button
                onClick={() => dispatch(setActiveSearchTab("where"))}
                className="hover:text-neutral-950 dark:hover:text-white transition pb-1 border-b-2 border-transparent cursor-pointer"
              >
                Private Escapes
              </button>
            </div>
          )}

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Quick Search Button (Visible on Mobile) */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                dispatch(setSearchExpanded(true));
                dispatch(setActiveSearchTab("where"));
              }}
              className="md:hidden relative rounded-full h-9 w-9 border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2.2] text-brand-primary" />
            </Button>

            {/* Interactive Persona Switcher Pill (Only visible when logged in) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleToggleRole}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-sans font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${
                  currentRole === "host"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                    : "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                }`}
                title="Click to toggle Role (Guest vs Host)"
              >
                <span className="flex h-2 w-2 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      currentRole === "host" ? "bg-emerald-400" : "bg-blue-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      currentRole === "host" ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  />
                </span>
                <span>
                  {currentRole === "host"
                    ? isBengali
                      ? "👑 হোস্ট মোড"
                      : "👑 Host Mode"
                    : isBengali
                      ? "👤 গেস্ট মোড"
                      : "👤 Guest Mode"}
                </span>
                <span className="text-[10px] opacity-75 font-normal">
                  ({userDisplayName})
                </span>
              </button>
            )}

            {/* List a Sanctuary / Switch to Host Action */}
            {isAuthenticated ? (
              currentRole === "host" && (
                <Link
                  href="/host/create"
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-sans font-semibold bg-brand-primary-light text-brand-primary hover:bg-brand-primary hover:text-white transition shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t("nav.listSanctuary")}</span>
                </Link>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  dispatch(setAuthModalOpen({ open: true, tab: "login" }));
                }}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-sans font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t("nav.listSanctuary")}</span>
              </button>
            )}

            {/* Language Switcher (EN / বাংলা) */}
            <div className="hidden sm:flex items-center gap-2 font-heading text-sm font-medium text-neutral-600 dark:text-neutral-300">
              <LanguageToggle />
            </div>

            {/* Theme Switcher (Dark / Light Mode) */}
            {/* <ThemeToggle variant="icon" /> */}

            {/* Filter quick button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(setFilterModalOpen(true))}
              className="relative rounded-full h-9 w-9 sm:h-10 sm:w-10 border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none hover:shadow-xs"
              title={t("common.filter")}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-primary ring-2 ring-white dark:ring-neutral-900" />
              )}
            </Button>

            {/* Shadcn DropdownMenu for User Profile & Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex items-center gap-1.5 border border-neutral-200/90 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-full hover:shadow-xs transition focus:outline-none cursor-pointer"
                  aria-label="User menu"
                >
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-brand-primary/20">
                    {isAuthenticated && currentUser?.avatar ? (
                      <AvatarImage
                        src={currentUser.avatar}
                        alt={currentUser.name || "User"}
                      />
                    ) : null}
                    <AvatarFallback className="bg-brand-secondary text-white font-sans font-semibold text-xs">
                      {isAuthenticated ? (
                        userInitial
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {isAuthenticated && favoriteIds.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full bg-brand-primary text-[10px] font-sans font-bold text-white flex items-center justify-center border-none">
                      {favoriteIds.length}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 bg-white rounded-3xl shadow-2xl border border-neutral-100 py-3 z-50 dark:bg-neutral-900 dark:border-neutral-800"
              >
                {!isAuthenticated ? (
                  <>
                    <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                        {isBengali
                          ? "স্বাগতম Travistay তে"
                          : "Welcome to Travistay"}
                      </p>
                      <p className="text-xs text-neutral-500 font-serif mt-0.5">
                        {isBengali
                          ? "বুকিং বা হোস্ট করার জন্য সাইন ইন করুন"
                          : "Sign in to book stays or manage listings"}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() =>
                            dispatch(
                              setAuthModalOpen({ open: true, tab: "login" }),
                            )
                          }
                          className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl h-9 cursor-pointer"
                        >
                          <RiLoginCircleLine className="text-lg mr-1" />{" "}
                          {t("nav.signIn")}
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            dispatch(
                              setAuthModalOpen({ open: true, tab: "signup" }),
                            )
                          }
                          className="flex-1 text-xs font-semibold rounded-xl h-8 cursor-pointer"
                        >
                          {t("nav.signUp")}
                        </Button> */}
                      </div>
                    </div>

                    <DropdownMenuGroup className="py-2">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/blog"
                          className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-brand-secondary" />
                            <span>The Travistay Journal & Stories</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/faq"
                          className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                        >
                          <div className="flex items-center gap-3">
                            <HelpCircle className="w-4 h-4 text-neutral-400" />
                            <span>
                              {isBengali
                                ? "সাহায্য ও সাধারণ প্রশ্ন"
                                : "Help & FAQ"}
                            </span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-secondary">
                        {currentRole === "host"
                          ? isBengali
                            ? "হোস্ট অ্যাকাউন্ট"
                            : "Host Account"
                          : isBengali
                            ? "গেস্ট অ্যাকাউন্ট"
                            : "Guest Account"}
                      </p>
                      <p className="font-heading font-semibold text-base text-neutral-900 dark:text-white mt-0.5">
                        {currentUser?.name ||
                          (isBengali ? "ব্যবহারকারী" : "User")}
                      </p>
                      <p className="text-xs text-neutral-400 font-sans font-normal truncate">
                        {currentUser?.email || currentUser?.phone || ""}
                      </p>
                    </DropdownMenuLabel>

                    {/* Mode Switcher */}
                    <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                      <DropdownMenuItem
                        asChild
                        onSelect={(e) => {
                          e.preventDefault();
                          handleToggleRole();
                        }}
                        className="p-3 rounded-2xl focus:bg-transparent cursor-pointer"
                      >
                        <button
                          type="button"
                          disabled={isTogglingRole}
                          onClick={handleToggleRole}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-brand-primary-light dark:bg-rose-950/40 text-brand-primary font-sans font-semibold text-xs hover:opacity-90 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {isTogglingRole ? (
                              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                            ) : (
                              <Layers className="w-4 h-4" />
                            )}
                            <span>
                              {currentRole === "guest"
                                ? t("nav.switchToHost")
                                : t("nav.switchToGuest")}
                            </span>
                          </div>
                          <Badge className="text-[10px] uppercase font-bold bg-brand-primary hover:bg-brand-primary text-white px-2 py-0.5 rounded-full border-none">
                            {currentRole === "guest" ? "Host" : "Guest"}
                          </Badge>
                        </button>
                      </DropdownMenuItem>
                    </div>

                    {/* Nav Links according to Role */}
                    <DropdownMenuGroup className="py-2">
                      {currentRole === "host" ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/host/profile"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <UserIcon className="w-4 h-4 text-brand-primary" />
                                <span>
                                  {isBengali
                                    ? "হোস্ট প্রোফাইল ও সেটিংস"
                                    : "Host Profile & Banking"}
                                </span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-brand-primary font-semibold border-none"
                              >
                                Manage
                              </Badge>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/host"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-brand-primary" />
                                <span>{t("host.dashboard")}</span>
                              </div>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/host/listings"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-brand-secondary" />
                                <span>{t("host.myListings")}</span>
                              </div>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/host/messages"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-brand-primary" />
                                <span>{t("host.guestMessages")}</span>
                              </div>
                              {hostUnreadCount > 0 && (
                                <Badge className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-brand-primary text-white font-semibold border-none">
                                  {hostUnreadCount} {isBengali ? "নতুন" : "New"}
                                </Badge>
                              )}
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/host/reports"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                <span>{t("host.reports")}</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 font-semibold border-none"
                              >
                                CSV/PDF
                              </Badge>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/profile"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <UserIcon className="w-4 h-4 text-brand-primary" />
                                <span>{t("guest.profileTitle")}</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-brand-primary font-semibold border-none"
                              >
                                Edit
                              </Badge>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/profile/messages"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-brand-primary" />
                                <span>{t("guest.hostMessages")}</span>
                              </div>
                              {guestUnreadCount > 0 && (
                                <Badge className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-brand-primary text-white font-semibold border-none">
                                  {guestUnreadCount}{" "}
                                  {isBengali ? "নতুন" : "New"}
                                </Badge>
                              )}
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/profile/wishlist"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <Heart className="w-4 h-4 text-brand-primary" />
                                <span>{t("guest.savedWishlist")}</span>
                              </div>
                              <Badge className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-brand-primary-light text-brand-primary font-semibold border-none">
                                {favoriteIds.length}
                              </Badge>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href="/trips"
                              className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                            >
                              <div className="flex items-center gap-3">
                                <Luggage className="w-4 h-4 text-brand-secondary" />
                                <span>{t("guest.myBookings")}</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold dark:bg-neutral-800 dark:text-neutral-400 border-none"
                              >
                                {reservations.length}
                              </Badge>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuItem asChild>
                        <Link
                          href="/blog"
                          className="flex items-center justify-between px-5 py-2.5 text-sm font-serif text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 transition rounded-none"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-brand-secondary" />
                            <span>The Travistay Journal & Stories</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator />

                {/* Quick Language Switcher inside Dropdown */}
                <div className="px-5 py-2.5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 text-xs font-sans">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Globe className="w-4 h-4 text-brand-primary" />
                    <span>{t("nav.language")}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-full">
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                        language === "en"
                          ? "bg-brand-primary text-white shadow-2xs"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("bn")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                        language === "bn"
                          ? "bg-brand-primary text-white shadow-2xs"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                      }`}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="pt-2 px-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(logout());
                        router.push("/");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-sans font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                    >
                      {isBengali ? "লগ আউট করুন" : "Log Out"}
                    </button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Pill Bar (Visible on Mobile when not expanded) */}
        {!isSearchExpanded && (
          <div className="md:hidden pb-3 pt-0 px-1 animate-in fade-in">
            <button
              type="button"
              onClick={() => {
                dispatch(setSearchExpanded(true));
                dispatch(setActiveSearchTab("where"));
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs text-left transition-all active:scale-98 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                <Search className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="flex-1 truncate">
                <span className="block text-xs font-heading font-semibold text-neutral-900 dark:text-white truncate">
                  {filter.location || t("nav.anyDestination")}
                </span>
                <span className="block text-[10px] font-sans text-neutral-400 truncate">
                  {filter.checkIn
                    ? formatDateRange(filter.checkIn, filter.checkOut)
                    : t("nav.pickDates")}{" "}
                  •{" "}
                  {filter.guests.adults > 1 || filter.guests.children > 0
                    ? formatGuestSummary(filter.guests)
                    : t("nav.addGuests")}
                </span>
              </div>
              <div className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}

        {/* Expanded Big Search Bar (Desktop Only) */}
        {isSearchExpanded && (
          <div className="hidden md:block">
            <SearchExpandedBar />
          </div>
        )}
      </div>
    </header>
  );
}
