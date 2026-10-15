"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
// import { useTheme } from "@/lib/theme/ThemeProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface ThemeToggleProps {
  variant?: "pill" | "icon" | "dropdown";
  className?: string;
}

export function ThemeToggle({
  variant = "dropdown",
  className = "",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { isBengali } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 flex items-center justify-center opacity-60 ${className}`}
      />
    );
  }

  // Quick 1-click icon toggle
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative w-9 h-9 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:border-brand-primary text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${className}`}
        title={
          resolvedTheme === "dark"
            ? isBengali
              ? "লাইট মোডে পরিবর্তন করুন"
              : "Switch to Light Mode"
            : isBengali
              ? "ডার্ক মোডে পরিবর্তন করুন"
              : "Switch to Dark Mode"
        }
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
        ) : (
          <Moon className="w-4 h-4 text-brand-primary stroke-[2.2]" />
        )}
      </button>
    );
  }

  // Pill toggle button with label
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:border-brand-primary text-xs font-sans font-medium text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all cursor-pointer active:scale-95 ${className}`}
        title="Toggle dark/light theme"
      >
        {resolvedTheme === "dark" ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 stroke-[2.2]" />
            <span className="font-semibold">
              {isBengali ? "লাইট" : "Light"}
            </span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-brand-primary stroke-[2.2]" />
            <span className="font-semibold">
              {isBengali ? "ডার্ক" : "Dark"}
            </span>
          </>
        )}
      </button>
    );
  }

  // Full Dropdown with Light, Dark, System options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:border-brand-primary text-xs font-sans font-medium text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all cursor-pointer active:scale-95 ${className}`}
          title={isBengali ? "থিম পরিবর্তন করুন" : "Adjust theme"}
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-3.5 h-3.5 text-brand-primary stroke-[2.2]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
          )}
          <span className="font-semibold">
            {theme === "system"
              ? isBengali
                ? "সিস্টেম"
                : "Auto"
              : theme === "dark"
                ? isBengali
                  ? "ডার্ক"
                  : "Dark"
                : isBengali
                  ? "লাইট"
                  : "Light"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 z-[9999] p-1 shadow-xl rounded-2xl"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center justify-between text-xs font-sans cursor-pointer rounded-xl py-2 px-2.5 ${
            theme === "light"
              ? "text-brand-primary font-bold bg-brand-primary/10"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBengali ? "লাইট মোড" : "Light Mode"}</span>
          </div>
          {theme === "light" && (
            <Check className="w-3.5 h-3.5 text-brand-primary stroke-[2.5]" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-between text-xs font-sans cursor-pointer rounded-xl py-2 px-2.5 ${
            theme === "dark"
              ? "text-brand-primary font-bold bg-brand-primary/10"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-blue-500" />
            <span>{isBengali ? "ডার্ক মোড" : "Dark Mode"}</span>
          </div>
          {theme === "dark" && (
            <Check className="w-3.5 h-3.5 text-brand-primary stroke-[2.5]" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center justify-between text-xs font-sans cursor-pointer rounded-xl py-2 px-2.5 ${
            theme === "system"
              ? "text-brand-primary font-bold bg-brand-primary/10"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-neutral-400" />
            <span>{isBengali ? "ডিভাইস সিস্টেম" : "System (Auto)"}</span>
          </div>
          {theme === "system" && (
            <Check className="w-3.5 h-3.5 text-brand-primary stroke-[2.5]" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
