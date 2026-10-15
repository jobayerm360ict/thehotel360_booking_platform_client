"use client";

import React, { Suspense } from "react";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { HostProfileSettings } from "@/components/host/HostProfileSettings";

import { HostLayoutSkeleton } from "@/components/common/Skeletons";

function HostProfileContent() {
  return (
    <HostLayoutWrapper>
      <div className="space-y-5 animate-fade-in">
        <HostProfileSettings />
      </div>
    </HostLayoutWrapper>
  );
}

export default function HostProfilePage() {
  return (
    <Suspense fallback={<HostLayoutSkeleton />}>
      <HostProfileContent />
    </Suspense>
  );
}
