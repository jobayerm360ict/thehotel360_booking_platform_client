"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { FileSpreadsheet, ChevronRight, TrendingUp } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { HostReportsSection } from "@/components/host/HostReportsSection";

function HostReportsContent() {
  const hostedListings = useAppSelector((state) => state.listings.hostItems);
  const hostReservations = useAppSelector((state) => state.booking.reservations);


  return (
    <HostLayoutWrapper>
      <div className="space-y-5 animate-fade-in">
        <HostReportsSection
          reservations={hostReservations}
          hostedListings={hostedListings}
        />
      </div>
    </HostLayoutWrapper>
  );
}

export default function HostReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HostReportsContent />
    </Suspense>
  );
}
