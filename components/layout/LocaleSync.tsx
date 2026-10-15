"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLanguage, Language } from "@/store/slices/languageSlice";

interface LocaleSyncProps {
  locale: Language;
}

export function LocaleSync({ locale }: LocaleSyncProps) {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(
    (state) => state.language?.currentLanguage || "en"
  );

  useEffect(() => {
    // 1. Sync HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }

    // 2. Sync Redux state if different
    if (currentLanguage !== locale) {
      dispatch(setLanguage(locale));
    }

    // 3. Sync cookie and localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("travistay_lang", locale);
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Ignore storage errors
      }
    }
  }, [locale, currentLanguage, dispatch]);

  return null;
}
