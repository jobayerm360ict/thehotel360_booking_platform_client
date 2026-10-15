"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { HostSidebar } from "@/components/host/HostSidebar";

import { HostLayoutSkeleton } from "@/components/common/Skeletons";

interface HostLayoutWrapperProps {
  children: React.ReactNode;
}

export function HostLayoutWrapper({ children }: HostLayoutWrapperProps) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gate host content until the browser has mounted.
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      if (!isAuthenticated && !token) {
        router.push("/");
      }
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return <HostLayoutSkeleton>{children}</HostLayoutSkeleton>;
  }
  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 pt-2.5 pb-20 md:pt-4 md:pb-8 transition-colors">
      <div className="max-w-[1300px] mx-auto px-3 sm:px-5 lg:px-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5">
          {/* Left Navigation Sidebar (Desktop sticky + Mobile responsive strip) */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 self-start">
            <HostSidebar />
          </aside>

          {/* Right Main Content Panel */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
