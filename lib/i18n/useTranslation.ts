"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLanguage,
  toggleLanguage,
  initializeLanguage,
  Language,
} from "@/store/slices/languageSlice";
import { translations } from "./translations";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof translations.en>;

export function useTranslation() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const currentLanguage = useAppSelector(
    (state) => state.language?.currentLanguage || "en"
  );

  // Sync with pathname locale or localStorage
  useEffect(() => {
    if (pathname) {
      if ((pathname === "/bn" || pathname.startsWith("/bn/")) && currentLanguage !== "bn") {
        dispatch(setLanguage("bn"));
        return;
      }
      if ((pathname === "/en" || pathname.startsWith("/en/")) && currentLanguage !== "en") {
        dispatch(setLanguage("en"));
        return;
      }
    }
    dispatch(initializeLanguage());
  }, [pathname, currentLanguage, dispatch]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");

    // 1. Try current language
    let current: unknown =
      translations[currentLanguage as Language] || translations.en;
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        current = null;
        break;
      }
    }

    // 2. Fallback to English if not found
    if (typeof current !== "string") {
      let fallback: unknown = translations.en;
      for (const k of keys) {
        if (fallback && typeof fallback === "object" && k in fallback) {
          fallback = (fallback as Record<string, unknown>)[k];
        } else {
          fallback = null;
          break;
        }
      }
      current = typeof fallback === "string" ? fallback : key;
    }

    let result = typeof current === "string" ? current : key;

    // 3. Param interpolation
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, "g"), String(val));
      });
    }

    return result;
  };

  const handleSetLanguage = (lang: Language) => {
    dispatch(setLanguage(lang));
  };

  const handleToggle = () => {
    dispatch(toggleLanguage());
  };

  return {
    t,
    language: currentLanguage,
    setLanguage: handleSetLanguage,
    toggleLanguage: handleToggle,
    isBengali: currentLanguage === "bn",
  };
}
