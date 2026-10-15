"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (range: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
  className?: string;
  minDate?: string;
  monthsToShow?: 1 | 2;
  onApply?: () => void;
}

export function Calendar({
  startDate,
  endDate,
  onChange,
  className,
  minDate,
  monthsToShow = 2,
  onApply,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime()))
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date();
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

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

  const formatDateStr = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return "Add date";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateNights = (s: string | null, e: string | null) => {
    if (!s || !e) return 0;
    const d1 = new Date(s);
    const d2 = new Date(e);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const minAllowed = minDate || todayStr;

  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      // Pick start date
      onChange({ startDate: dateStr, endDate: null });
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        // Reset and set as start date
        onChange({ startDate: dateStr, endDate: null });
      } else if (dateStr === startDate) {
        // Same day selection (1 night stay)
        onChange({ startDate: dateStr, endDate: dateStr });
      } else {
        // Complete range
        onChange({ startDate, endDate: dateStr });
      }
    }
  };

  const isSelectedStart = (dateStr: string) => startDate === dateStr;
  const isSelectedEnd = (dateStr: string) => endDate === dateStr;
  const isInRange = (dateStr: string) => {
    if (startDate && endDate) {
      return dateStr > startDate && dateStr < endDate;
    }
    if (startDate && hoverDate && !endDate) {
      return dateStr > startDate && dateStr < hoverDate;
    }
    return false;
  };

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Fast preset helper
  const applyPreset = (daysFromNow: number, stayDuration: number) => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + daysFromNow,
    );
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + stayDuration,
    );

    const startStr = formatDateStr(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const endStr = formatDateStr(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
    );

    onChange({ startDate: startStr, endDate: endStr });
  };

  // Render a single month calendar grid
  const renderMonthGrid = (monthOffset: number, showNavControls: boolean) => {
    const monthDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + monthOffset,
      1,
    );
    const startDayOfWeek = monthDate.getDay();
    const totalDays = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
    ).getDate();

    const monthTitle = monthDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const isFirstMonth = monthOffset === 0;
    const isLastMonth = monthOffset === monthsToShow - 1;

    return (
      <div className="flex-1 w-full min-w-0 select-none">
        {/* Month Title Header with Integrated Navigation Arrows */}
        <div className="flex items-center justify-between mb-3 px-1">
          {showNavControls && isFirstMonth ? (
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7" />
          )}

          <h3 className="font-heading font-semibold text-neutral-900 dark:text-white text-sm sm:text-base tracking-tight text-center">
            {monthTitle}
          </h3>

          {showNavControls && isLastMonth ? (
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7" />
          )}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {daysOfWeek.map((day, idx) => (
            <span
              key={`${day}-${idx}`}
              className="text-[11px] font-sans font-semibold text-neutral-400 dark:text-neutral-500 py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {/* Empty cells before month start */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-full" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDateStr(
              monthDate.getFullYear(),
              monthDate.getMonth(),
              day,
            );
            const isDisabled = dateStr < minAllowed;
            const isStart = isSelectedStart(dateStr);
            const isEnd = isSelectedEnd(dateStr);
            const inRange = isInRange(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className={cn(
                  "relative flex items-center justify-center h-9 w-full transition-colors duration-150",
                  inRange && "bg-brand-primary/10 dark:bg-brand-primary/20",
                  isStart &&
                    endDate &&
                    "rounded-l-full bg-brand-primary/10 dark:bg-brand-primary/20",
                  isEnd &&
                    startDate &&
                    "rounded-r-full bg-brand-primary/10 dark:bg-brand-primary/20",
                )}
              >
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateClick(dateStr)}
                  onMouseEnter={() => !endDate && setHoverDate(dateStr)}
                  onMouseLeave={() => !endDate && setHoverDate(null)}
                  className={cn(
                    "h-8 w-8 rounded-full text-xs font-sans font-medium flex items-center justify-center cursor-pointer transition-all duration-150",
                    isDisabled &&
                      "text-neutral-300 dark:text-neutral-700 cursor-not-allowed pointer-events-none",
                    !isDisabled &&
                      !isStart &&
                      !isEnd &&
                      !inRange &&
                      "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
                    inRange &&
                      "text-brand-primary font-bold dark:text-brand-primary font-semibold",
                    (isStart || isEnd) &&
                      "bg-brand-primary text-white font-bold shadow-xs scale-105 hover:bg-brand-primary-hover",
                    isToday &&
                      !isStart &&
                      !isEnd &&
                      "border border-brand-primary text-brand-primary font-semibold",
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nights = calculateNights(startDate, endDate);

  return (
    <div
      className={cn(
        "p-3 sm:p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl select-none w-full max-w-full overflow-hidden",
        className,
      )}
    >
      {/* Top Presets Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 border-b border-neutral-100 dark:border-neutral-800 scrollbar-none">
        <span className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-0.5">
          Quick:
        </span>
        <button
          type="button"
          onClick={() => applyPreset(1, 2)}
          className="px-2.5 py-1 rounded-full text-[11px] font-sans font-medium border border-neutral-200 dark:border-neutral-700 hover:border-brand-primary hover:text-brand-primary shrink-0 cursor-pointer transition-colors"
        >
          This Weekend (2n)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(7, 3)}
          className="px-2.5 py-1 rounded-full text-[11px] font-sans font-medium border border-neutral-200 dark:border-neutral-700 hover:border-brand-primary hover:text-brand-primary shrink-0 cursor-pointer transition-colors"
        >
          Next Week (3n)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(14, 7)}
          className="px-2.5 py-1 rounded-full text-[11px] font-sans font-medium border border-neutral-200 dark:border-neutral-700 hover:border-brand-primary hover:text-brand-primary shrink-0 cursor-pointer transition-colors"
        >
          1 Week
        </button>
      </div>

      {/* Calendar Months Grid */}
      <div className="flex flex-col md:flex-row gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-neutral-800">
        {renderMonthGrid(0, true)}
        {monthsToShow > 1 && (
          <div className="pt-3 md:pt-0 md:pl-4 flex-1">
            {renderMonthGrid(1, true)}
          </div>
        )}
      </div>

      {/* Bottom Range Summary & Actions (Compact & Non-overflowing) */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
        {/* Date Tiles Grid */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
            <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              Check-in
            </span>
            <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate mt-0.5">
              {formatDisplayDate(startDate)}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
            <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              Checkout
            </span>
            <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate mt-0.5">
              {formatDisplayDate(endDate)}
            </span>
          </div>
        </div>

        {/* Footer Actions Row */}
        <div className="flex items-center justify-between pt-0.5">
          {nights > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-semibold">
              {nights} night{nights > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400 font-serif">
              Select date range
            </span>
          )}

          <div className="flex items-center gap-2">
            {startDate && (
              <button
                type="button"
                onClick={() => onChange({ startDate: null, endDate: null })}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}

            {onApply && (
              <button
                type="button"
                onClick={onApply}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-sans font-semibold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xs cursor-pointer active:scale-95 transition"
              >
                <Check className="w-3 h-3" />
                <span>Apply</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
