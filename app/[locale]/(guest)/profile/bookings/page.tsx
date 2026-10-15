"use client";

import React from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileBookingsTab } from "@/components/profile/ProfileBookingsTab";

export default function ProfileBookingsPage() {
  return (
    <ProfileLayoutWrapper>
      <ProfileBookingsTab />
    </ProfileLayoutWrapper>
  );
}
