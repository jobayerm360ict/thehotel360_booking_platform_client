"use client";

import React from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileInfoTab } from "@/components/profile/ProfileInfoTab";

export default function ProfilePage() {
  return (
    <ProfileLayoutWrapper>
      <ProfileInfoTab />
    </ProfileLayoutWrapper>
  );
}
