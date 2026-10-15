"use client";

import React, { Suspense } from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileMessagesTab } from "@/components/profile/ProfileMessagesTab";

export default function ProfileMessagesPage() {
  return (
    <ProfileLayoutWrapper>
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-400">Loading messages...</div>}>
        <ProfileMessagesTab />
      </Suspense>
    </ProfileLayoutWrapper>
  );
}
