"use client";

import React from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileNotificationsTab } from "@/components/profile/ProfileNotificationsTab";

export default function ProfileNotificationsPage() {
  return (
    <ProfileLayoutWrapper>
      <ProfileNotificationsTab />
    </ProfileLayoutWrapper>
  );
}
