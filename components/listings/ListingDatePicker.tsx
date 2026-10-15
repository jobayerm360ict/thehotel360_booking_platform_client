"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Calendar as CalendarIcon,
  Sparkles,
  Info,
} from "lucide-react";

interface ListingDatePickerProps {
  city: string;
  startDate: string | null;
  endDate: string | null;
  datesAvailable?: string;
  onDatesChange: (start: string | null, end: string | null) => void;
}

export function ListingDatePicker({
  city,
  startDate,
  endDate,
  datesAvailable,
  onDatesChange,
}: ListingDatePickerProps) {
  // Base month for navigation (default to October 2026)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (startDate) {
      const d = new Date(startDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2026, 9, 1); // Oct 2026
  });

  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Parse YYYY-MM-DD to Date
  const parseDateStr = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const toDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const startD = parseDateStr(startDate);
  const endD = parseDateStr(endDate);

  // Calculate nights
  const calculateNights = (): number => {
    if (!startD || !endD) return 0;
    const diff = endD.getTime() - startD.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  // Format date display: "Oct 9, 2026"
  const formatDateDisplay = (d: Date): string => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const month1 = currentMonth;
  const month2 = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1,
  );

  // Today reference (Oct 4, 2026)
  const minDate = new Date(2026, 9, 4);

  /**
   * Check if a specific date is AVAILABLE for booking.
   * Listing Availability Rule:
   * - Dates in past (< minDate) are unavailable.
   * - In October 2026: Available from Oct 10 to Oct 25. (Oct 1-9 past/blocked, Oct 26-31 booked by others)
   * - In November 2026: Available from Nov 1 to Nov 20. (Nov 21-30 booked)
   * - Other future months: Available except last week.
   */
  const isDateAvailable = (d: Date): boolean => {
    if (d < minDate) return false;

    const month = d.getMonth(); // 9 = Oct, 10 = Nov
    const day = d.getDate();

    if (month === 9) {
      // October: 10 to 25 available
      return day >= 10 && day <= 25;
    } else if (month === 10) {
      // November: 1 to 20 available
      return day >= 1 && day <= 20;
    } else if (month === 11) {
      // December: 1 to 22 available
      return day >= 1 && day <= 22;
    }

    // Default other months
    return day <= 24;
  };

  // Handle date click
  const handleDateClick = (dateStr: string) => {
    const clickedD = parseDateStr(dateStr)!;

    if (!isDateAvailable(clickedD)) return;

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onDatesChange(dateStr, null);
    } else if (startDate && !endDate) {
      if (clickedD < startD!) {
        // Earlier than start date -> restart with this date
        onDatesChange(dateStr, null);
      } else if (clickedD.getTime() === startD!.getTime()) {
        // Deselect
        onDatesChange(null, null);
      } else {
        // Ensure no blocked dates are between start and end
        let hasBlockedInRange = false;
        const cur = new Date(startD!.getTime());
        while (cur <= clickedD) {
          if (!isDateAvailable(cur)) {
            hasBlockedInRange = true;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (hasBlockedInRange) {
          // If range contains unavailable dates, reset start to this date
          onDatesChange(dateStr, null);
        } else {
          onDatesChange(startDate, dateStr);
        }
      }
    }
  };

  const renderMonthCalendar = (
    baseMonth: Date,
    showPrevArrow: boolean,
    showNextArrow: boolean,
  ) => {
    const year = baseMonth.getFullYear();
    const month = baseMonth.getMonth();
    const monthName = baseMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="flex-1 min-w-[280px]">
        {/* Month Header */}
        <div className="flex items-center justify-between h-10 mb-4 px-1">
          {showPrevArrow ? (
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer text-neutral-700 dark:text-neutral-300"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <h4 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
            {monthName}
          </h4>

          {showNextArrow ? (
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer text-neutral-700 dark:text-neutral-300"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Day Names Row */}
        <div className="grid grid-cols-7 text-center mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-10" />;
            }

            const dateStr = toDateStr(day);
            const isAvailable = isDateAvailable(day);
            const isStart = startDate === dateStr;
            const isEnd = endDate === dateStr;

            const isBetween = startD && endD && day > startD && day < endD;

            const isHoverRange =
              startDate &&
              !endDate &&
              hoverDate &&
              day > startD! &&
              day <= parseDateStr(hoverDate)!;

            return (
              <div
                key={dateStr}
                className={`relative h-10 flex items-center justify-center ${
                  isBetween || isHoverRange
                    ? "bg-brand-primary/10 dark:bg-brand-primary/20"
                    : ""
                } ${
                  isStart && (endDate || hoverDate)
                    ? "rounded-l-full bg-brand-primary/10 dark:bg-brand-primary/20"
                    : ""
                } ${
                  isEnd
                    ? "rounded-r-full bg-brand-primary/10 dark:bg-brand-primary/20"
                    : ""
                }`}
              >
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() =>
                    !endDate && isAvailable && setHoverDate(dateStr)
                  }
                  onMouseLeave={() => setHoverDate(null)}
                  title={
                    isAvailable
                      ? "Available for booking"
                      : "Unavailable / Booked"
                  }
                  className={`relative w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs transition-all duration-200 ${
                    !isAvailable
                      ? "text-neutral-300 dark:text-neutral-600 line-through cursor-not-allowed opacity-60"
                      : isStart || isEnd
                        ? "bg-brand-primary text-white font-bold shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/25 scale-105 z-10 cursor-pointer"
                        : isBetween || isHoverRange
                          ? "text-brand-primary font-semibold hover:bg-brand-primary/20 cursor-pointer"
                          : "text-neutral-900 dark:text-neutral-100 font-semibold hover:bg-brand-primary/10 hover:text-brand-primary cursor-pointer"
                  }`}
                >
                  <span>{day.getDate()}</span>
                  {/* Subtle green dot for available dates (when not selected) */}
                  {isAvailable && !isStart && !isEnd && !isBetween && (
                    <span className="w-1 h-1 rounded-full bg-emerald-500/80 -mt-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 border-b border-neutral-200 dark:border-neutral-800 space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
            {nights > 0
              ? `${nights} ${nights === 1 ? "night" : "nights"} in ${city}`
              : startDate
                ? "Select checkout date"
                : `Select check-in date in ${city}`}
          </h3>
          <p className="text-sm text-neutral-500 font-sans mt-1">
            {startD && endD
              ? `${formatDateDisplay(startD)} – ${formatDateDisplay(endD)}`
              : startD
                ? `Check-in: ${formatDateDisplay(startD)} (Click your checkout date)`
                : "Select available dates marked with green indicators"}
          </p>
        </div>

        {/* Quick selection presets */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 -mx-1 px-1">
          <button
            type="button"
            onClick={() => onDatesChange("2026-10-12", "2026-10-18")}
            className="text-xs px-3 py-1.5 rounded-full border border-brand-primary/40 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary font-semibold transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            Oct 12 – 18 (Recommended)
          </button>
          <button
            type="button"
            onClick={() => onDatesChange("2026-10-16", "2026-10-19")}
            className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            Weekend Stay
          </button>
        </div>
      </div>

      {/* Calendar Container: 1 Month on Mobile with both arrows, 2 Months on Desktop */}
      <div className="bg-white dark:bg-neutral-900/60 p-4 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        {/* Mobile View */}
        <div className="block md:hidden">
          {renderMonthCalendar(month1, true, true)}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-row gap-8 lg:gap-12">
          {renderMonthCalendar(month1, true, false)}
          {renderMonthCalendar(month2, false, true)}
        </div>
      </div>

      {/* Legend & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Availability Legend */}
        <div className="flex items-center gap-5 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Available
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="line-through text-neutral-400">
              Booked / Unavailable
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-xs" />
            <span className="font-medium text-brand-primary">
              Selected stay
            </span>
          </div>
        </div>

        {/* Clear dates & Keyboard controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-brand-primary hover:bg-brand-primary/10 transition cursor-pointer"
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => onDatesChange(null, null)}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover underline transition cursor-pointer py-1 px-2 rounded-md"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Helper Drawer */}
      {showKeyboardShortcuts && (
        <div className="p-4 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-2xl border border-brand-primary/20 text-xs text-neutral-700 dark:text-neutral-300 animate-in fade-in duration-200 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-brand-primary">
            <Info className="w-4 h-4" />
            <span>Calendar Guidelines:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              • Green dotted dates are verified available for this listing
            </div>
            <div>• Click on check-in date then click checkout date</div>
            <div>• Crossed-out dates are already booked by other guests</div>
            <div>• Dates seamlessly sync with the booking payment summary</div>
          </div>
        </div>
      )}
    </div>
  );
}
