"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerFieldProps {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Helper to convert any input into DD-MM-YYYY for intuitive human typing
function formatToDisplay(val?: string): string {
  if (!val) return "";
  const clean = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-");
    return `${d}-${m}-${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    return clean;
  }
  return clean;
}

// Helper to parse user typed text or stored value into ISO YYYY-MM-DD
function parseToIso(str: string): string | null {
  if (!str) return null;
  const clean = str.trim().replace(/\//g, "-").replace(/\./g, "-");

  // Check YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const y = Number(ymdMatch[1]);
    const m = Number(ymdMatch[2]);
    const d = Number(ymdMatch[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // Check DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyMatch) {
    const d = Number(dmyMatch[1]);
    const m = Number(dmyMatch[2]);
    const y = Number(dmyMatch[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  return null;
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  error,
  helperText,
  required,
  minYear = 1930,
  maxYear = new Date().getFullYear(),
  className,
  containerClassName,
  disabled = false,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Raw typed text in the input
  const [rawText, setRawText] = React.useState<string>(() =>
    formatToDisplay(value),
  );

  // Sync internal text when external value prop changes
  React.useEffect(() => {
    setRawText(formatToDisplay(value));
  }, [value]);

  // Parse active date for calendar view
  const activeDate = React.useMemo(() => {
    const iso = parseToIso(rawText) || parseToIso(value || "");
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [rawText, value]);

  // Calendar view state (Month & Year)
  const [viewDate, setViewDate] = React.useState<Date>(() => {
    return activeDate || new Date(2000, 0, 1);
  });

  // Keep viewDate updated when activeDate changes
  React.useEffect(() => {
    if (activeDate) {
      setViewDate(activeDate);
    }
  }, [activeDate]);

  // Close calendar popover on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleYearChange = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
  };

  const handleMonthChange = (month: number) => {
    setViewDate(new Date(currentYear, month, 1));
  };

  // Calendar Day Selected
  const handleSelectDay = (day: number) => {
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    const display = `${d}-${m}-${y}`;
    setRawText(display);
    onChange?.(iso);
    setIsOpen(false);
  };

  // User typing in the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;
    setRawText(typed);

    // If completely cleared
    if (!typed.trim()) {
      onChange?.("");
      return;
    }

    // Try parsing as user types
    const iso = parseToIso(typed);
    if (iso) {
      onChange?.(iso);
      const [y, m, d] = iso.split("-").map(Number);
      setViewDate(new Date(y, m - 1, d));
    }
  };

  // Format on blur if valid
  const handleInputBlur = () => {
    const iso = parseToIso(rawText);
    if (iso) {
      const [y, m, d] = iso.split("-");
      setRawText(`${d}-${m}-${y}`);
      onChange?.(iso);
    } else if (!rawText.trim()) {
      setRawText("");
      onChange?.("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRawText("");
    onChange?.("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Generate days grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Years array
  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  const today = new Date();
  const isTodayMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  return (
    <div
      ref={containerRef}
      className={cn(
        "space-y-2 w-full text-left relative",
        containerClassName,
      )}
    >
      {label && (
        <label className="text-xs font-sans font-medium text-neutral-600 dark:text-neutral-300 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Dual Interaction Input: Direct Typing + Calendar Picker Button */}
      <div
        className={cn(
          "relative flex items-center h-11 w-full rounded-xl border border-neutral-200/90 dark:border-neutral-700/90 bg-white dark:bg-neutral-800 shadow-2xs transition-all duration-200",
          error && "border-rose-400 ring-rose-500/20",
          isOpen && "ring-2 ring-brand-primary/20 border-brand-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {/* Left Calendar Icon: Clickable to toggle popover */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className="h-full pl-3.5 pr-2 py-0 text-brand-primary shrink-0 flex items-center cursor-pointer transition-colors [&_svg]:text-brand-primary"
          title="Open calendar picker"
          tabIndex={-1}
        >
          <CalendarIcon className="w-4 h-4 text-brand-primary" />
        </button>

        {/* Editable Input: Type freely */}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={rawText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full h-full bg-transparent pr-16 py-2.5 text-sm font-sans font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none disabled:cursor-not-allowed"
        />

        {/* Right Actions: Clear button & Calendar Popover Trigger */}
        <div className="absolute right-2.5 flex items-center gap-1 shrink-0">
          {rawText && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            className="p-1.5 text-neutral-400 hover:text-brand-primary dark:text-neutral-500 dark:hover:text-brand-primary rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition cursor-pointer"
            title="Pick date from calendar"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Shadcn Luxury Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header with Fast Month & Year Pickers */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-2.5 py-1 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={currentYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-2.5 py-1 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer font-mono"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span
                key={d}
                className="text-[11px] font-sans font-semibold text-neutral-400 dark:text-neutral-500 py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                activeDate &&
                activeDate.getFullYear() === currentYear &&
                activeDate.getMonth() === currentMonth &&
                activeDate.getDate() === day;

              const isCurrentDay = isTodayMonth && today.getDate() === day;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-sans font-medium transition-all duration-150 cursor-pointer",
                    isSelected
                      ? "bg-brand-primary text-white font-semibold shadow-xs scale-105"
                      : isCurrentDay
                        ? "border border-brand-primary/50 text-brand-primary font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                const y = today.getFullYear();
                const m = String(today.getMonth() + 1).padStart(2, "0");
                const d = String(today.getDate()).padStart(2, "0");
                const iso = `${y}-${m}-${d}`;
                setRawText(`${d}-${m}-${y}`);
                onChange?.(iso);
                setIsOpen(false);
              }}
              className="text-brand-primary font-semibold hover:underline cursor-pointer"
            >
              Today
            </button>
            {rawText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] font-sans text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] font-sans text-neutral-400 dark:text-neutral-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Re-export DateInputField alias
export const DateInputField = DatePickerField;
