"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CounterFieldProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CounterField({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  icon,
  className,
  disabled = false,
}: CounterFieldProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || value <= min) return;
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || value >= max) return;
    onChange(Math.min(max, value + step));
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/70 transition-colors",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 flex items-center justify-center text-brand-primary shrink-0 shadow-2xs">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <label className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
            {label}
          </label>
          {description && (
            <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:border-brand-primary hover:text-brand-primary disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 bg-white dark:bg-neutral-800"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-7 text-center font-sans font-bold text-sm text-neutral-900 dark:text-white select-none">
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:border-brand-primary hover:text-brand-primary disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 bg-white dark:bg-neutral-800"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
