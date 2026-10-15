"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { PlatformHydrator } from "./PlatformHydrator";
import { initializeAuth, fetchCurrentUser } from "./slices/authSlice";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());

    // If token exists, synchronize user profile directly from API
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        store.dispatch(fetchCurrentUser());
      }
    }
  }, []);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator><PlatformHydrator>{children}</PlatformHydrator></AuthHydrator>
    </Provider>
  );
}
