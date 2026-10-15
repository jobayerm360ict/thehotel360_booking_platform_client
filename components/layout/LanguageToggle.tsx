"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface LanguageToggleProps {
  variant?: "pill" | "button" | "compact";
  className?: string;
}

export function LanguageToggle({
  variant = "pill",
  className = "",
}: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, isBengali } = useTranslation();

  const switchLocale = (newLocale: "en" | "bn") => {
    if (newLocale === language) return;

    setLanguage(newLocale);

    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    if (pathname) {
      let targetPath = pathname;
      if (targetPath.startsWith("/en")) {
        targetPath = targetPath.replace(/^\/en/, `/${newLocale}`);
      } else if (targetPath.startsWith("/bn")) {
        targetPath = targetPath.replace(/^\/bn/, `/${newLocale}`);
      } else {
        targetPath = `/${newLocale}${targetPath === "/" ? "" : targetPath}`;
      }
      router.push(targetPath);
    }
  };

  const handleToggle = () => {
    const nextLocale = isBengali ? "en" : "bn";
    switchLocale(nextLocale);
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:border-brand-primary text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer ${className}`}
        title={isBengali ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
      >
        <Globe className="w-3.5 h-3.5 text-brand-primary" />
        <span>{isBengali ? "বাং" : "EN"}</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:border-brand-primary text-xs font-sans font-medium text-neutral-700 dark:text-neutral-200 shadow-2xs transition-all cursor-pointer active:scale-95 ${className}`}
          title="Change language / ভাষা পরিবর্তন"
        >
          <Globe className="w-3.5 h-3.5 text-brand-primary stroke-[2]" />
          <span className="font-semibold">{isBengali ? "বাংলা" : "EN"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 z-50 p-1">
        <DropdownMenuItem
          onClick={() => switchLocale("en")}
          className={`flex items-center justify-between text-xs font-sans cursor-pointer ${
            language === "en"
              ? "text-brand-primary font-bold bg-brand-primary/5"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🇺🇸</span>
            <span>English</span>
          </div>
          {language === "en" && (
            <Check className="w-3.5 h-3.5 text-brand-primary" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => switchLocale("bn")}
          className={`flex items-center justify-between text-xs font-sans cursor-pointer ${
            language === "bn"
              ? "text-brand-primary font-bold bg-brand-primary/5"
              : "text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🇧🇩</span>
            <span>বাংলা</span>
          </div>
          {language === "bn" && (
            <Check className="w-3.5 h-3.5 text-brand-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
