"use client";

import React, { Suspense } from "react";
import { MessageSquare } from "lucide-react";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { HostChatView } from "@/components/messages/HostChatView";

function HostMessagesContent() {
  return (
    <HostLayoutWrapper>
      <div className="space-y-4 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-white dark:bg-neutral-900 rounded-md p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-sans text-brand-secondary font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquiries &amp; Reservations</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Guest Communications Hub</span>

            </h1>
            {/* <p className="font-serif text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Coordinate digital keycodes, early check-in requests, and personalized hospitality with travelers.
            </p> */}
          </div>


        </div>

        {/* Chat Suite (embedded neatly inside layout) */}
        <HostChatView embedded />
      </div>
    </HostLayoutWrapper>
  );
}

export default function HostMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HostMessagesContent />
    </Suspense>
  );
}
