import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "bn";

interface LanguageState {
  currentLanguage: Language;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    // 1. Check current URL pathname for locale prefix
    const path = window.location.pathname;
    if (path === "/bn" || path.startsWith("/bn/")) {
      return "bn";
    }
    if (path === "/en" || path.startsWith("/en/")) {
      return "en";
    }

    // 2. Check localStorage
    try {
      const saved = localStorage.getItem("travistay_lang") as Language | null;
      if (saved === "en" || saved === "bn") {
        return saved;
      }
    } catch {
      // Fallback
    }
  }
  return "en";
};

const initialState: LanguageState = {
  currentLanguage: "en",
};

export const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    initializeLanguage: (state) => {
      state.currentLanguage = getInitialLanguage();
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("travistay_lang", action.payload);
          document.cookie = `NEXT_LOCALE=${action.payload}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // Ignore
        }
      }
    },
    toggleLanguage: (state) => {
      const next: Language = state.currentLanguage === "en" ? "bn" : "en";
      state.currentLanguage = next;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("travistay_lang", next);
          document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // Ignore
        }
      }
    },
  },
});

export const { initializeLanguage, setLanguage, toggleLanguage } =
  languageSlice.actions;

export default languageSlice.reducer;
