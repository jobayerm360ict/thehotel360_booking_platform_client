"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Star, Image, Info, BedDouble, Calendar, MessageSquare, MapPin } from "lucide-react";

interface ListingStickyNavProps {
  hasRooms?: boolean;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  selectedRoomPrice?: number | null;
  onReserveClick?: () => void;
  scrollThreshold?: number;
}

interface NavItem {
  id: string;
  labelKey: "photos" | "about" | "rooms" | "calendar" | "reviews" | "location";
  defaultLabel: string;
  icon: React.ElementType;
}

export function ListingStickyNav({
  hasRooms = false,
  pricePerNight,
  rating,
  reviewCount,
  selectedRoomPrice,
  onReserveClick,
  scrollThreshold = 380,
}: ListingStickyNavProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("photos-section");

  const navItems: NavItem[] = useMemo(
    () => [
      { id: "photos-section", labelKey: "photos", defaultLabel: "Photos", icon: Image },
      { id: "about-section", labelKey: "about", defaultLabel: "About", icon: Info },
      ...(hasRooms
        ? ([{ id: "hotel-rooms-section", labelKey: "rooms", defaultLabel: "Rooms & Suites", icon: BedDouble }] as NavItem[])
        : []),
      { id: "date-picker-section", labelKey: "calendar", defaultLabel: "Availability", icon: Calendar },
      { id: "reviews-section", labelKey: "reviews", defaultLabel: "Reviews", icon: MessageSquare },
      { id: "map-section", labelKey: "location", defaultLabel: "Location", icon: MapPin },
    ],
    [hasRooms]
  );

  // Monitor scroll: show/hide navbar based on scroll amount & detect active section (ScrollSpy)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Only appear after user scrolls a certain amount (e.g. past title/into photo gallery)
      const photosEl = document.getElementById("photos-section");
      const effectiveThreshold = photosEl
        ? Math.max(photosEl.offsetTop + 120, scrollThreshold)
        : scrollThreshold;

      setIsVisible(scrollY > effectiveThreshold);

      // Determine active section for scrollspy
      const scrollPosition = scrollY + 160;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top - 50) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollThreshold, navItems]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Header is 80px (top-0 h-20), sticky nav is ~56px
    const navOffset = 135;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const handleReserve = () => {
    if (onReserveClick) {
      onReserveClick();
      return;
    }
    const bookingWidget = document.getElementById("booking-widget-section");
    if (bookingWidget) {
      const navOffset = 135;
      const elementPosition = bookingWidget.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: "smooth",
      });
    } else {
      scrollToSection("date-picker-section");
    }
  };

  const displayPrice = selectedRoomPrice || pricePerNight;

  return (
    <div
      className={`fixed top-20 left-0 right-0 z-30 w-full bg-[#fcfbf9]/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all duration-300 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Scrollable Navigation Tabs */}
          <nav
            aria-label="Listing in-page navigation"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1"
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              const label = t(`listingNav.${item.labelKey}`) || item.defaultLabel;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "opacity-100" : "opacity-70"}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Quick Price Preview & Reserve Button */}
          <div className="hidden md:flex items-center gap-4 animate-fade-in">
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-base font-bold text-neutral-900 dark:text-white">
                  {formatPrice(displayPrice)}
                </span>
                <span className="text-xs text-neutral-500 font-serif">
                  / {t("listingNav.night") || "night"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] text-neutral-500">
                <Star className="w-3 h-3 fill-brand-primary text-brand-primary" />
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {rating.toFixed(2)}
                </span>
                <span>({reviewCount})</span>
              </div>
            </div>

            <button
              onClick={handleReserve}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {t("listingNav.reserve") || "Reserve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
