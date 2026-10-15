"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Common Profile Form Skeleton
 * Matches the layout of ProfileInfoTab and HostProfileSettings
 */
export function ProfileFormSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-pulse",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Verified Status Banner Skeleton */}
      <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Avatar Section Skeleton */}
      <div className="flex items-center gap-5 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-3 w-56 rounded-md" />
          <Skeleton className="h-3 w-28 rounded-md mt-1" />
        </div>
      </div>

      {/* Input Fields Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Bio Textarea Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Buttons Skeleton */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Top Host Credentials Banner Skeleton
 */
export function HostHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-48 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Host Profile Full Skeleton (Header banner + Form)
 */
export function HostProfileSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <HostHeaderSkeleton />
      <ProfileFormSkeleton />
    </div>
  );
}

/**
 * Profile Sidebar Skeleton
 */
export function ProfileSidebarSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-pulse">
      {/* Profile Card Header */}
      <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-neutral-100 dark:border-neutral-800">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-3.5 w-40 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Nav Items */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
            <Skeleton className="w-5 h-5 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full Profile Layout Skeleton (Sidebar + Form)
 */
export function ProfileLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-1 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <aside className="lg:col-span-4 xl:col-span-3">
            <ProfileSidebarSkeleton />
          </aside>
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            <ProfileFormSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Host Dashboard & Layout Skeleton
 */
export function HostLayoutSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 pt-2.5 pb-20 md:pt-4 md:pb-8 transition-colors">
      <div className="max-w-[1300px] mx-auto px-3 sm:px-5 lg:px-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5">
          <aside className="lg:col-span-4 xl:col-span-3">
            <ProfileSidebarSkeleton />
          </aside>
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children || <HostProfileSkeleton />}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic Card Skeleton (for listings, bookings, trips)
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden space-y-3 p-4"
        >
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
            <Skeleton className="h-3 w-48 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md pt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Generic Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-neutral-50 dark:border-neutral-800/50">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md flex-1 max-w-xs" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Common Loading Overlay / Bar for saving or updating
 */
export function LoadingOverlay({ message = "Saving changes..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10 transition-all duration-300 animate-in fade-in">
      <div className="w-10 h-10 rounded-full border-3 border-brand-primary border-t-transparent animate-spin mb-3 shadow-md" />
      <p className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200">
        {message}
      </p>
    </div>
  );
}
