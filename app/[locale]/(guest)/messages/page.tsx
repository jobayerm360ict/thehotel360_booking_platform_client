"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import { GuestChatView } from "@/components/messages/GuestChatView";

function GuestMessagesContent() {
  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-6 sm:py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-sans text-neutral-500 mb-1">
              <Link href="/" className="hover:text-brand-primary">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/profile" className="hover:text-brand-primary">
                Guest Profile
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-900 dark:text-white font-medium">
                Host Messages
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Host Messages &amp; Sanctuary Inquiries</span>
            </h1>
            <p className="font-serif text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Communicate directly with your sanctuary hosts for check-in times, keycodes, and personalized hospitality.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-xs font-sans text-neutral-600 dark:text-neutral-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Travistay Protected Communications</span>
          </div>
        </div>

        {/* Guest Chat Suite */}
        <GuestChatView />
      </div>
    </div>
  );
}

export default function GuestMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 flex items-center justify-center p-8">
          <div className="animate-pulse text-xs font-sans text-neutral-400">
            Loading host messages...
          </div>
        </div>
      }
    >
      <GuestMessagesContent />
    </Suspense>
  );
}
