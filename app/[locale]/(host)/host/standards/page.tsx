"use client";

import React, { Suspense } from "react";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { HostSuperhostStandards } from "@/components/host/HostSuperhostStandards";

function HostStandardsContent() {
  return (
    <HostLayoutWrapper>
      <div className="space-y-5 animate-fade-in">
        <HostSuperhostStandards />
      </div>
    </HostLayoutWrapper>
  );
}

export default function HostStandardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HostStandardsContent />
    </Suspense>
  );
}
