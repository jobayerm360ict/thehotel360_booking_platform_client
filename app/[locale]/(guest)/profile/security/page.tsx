"use client";

import React from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileSecurityTab } from "@/components/profile/ProfileSecurityTab";

export default function ProfileSecurityPage() {
  return (
    <ProfileLayoutWrapper>
      <ProfileSecurityTab />
    </ProfileLayoutWrapper>
  );
}
