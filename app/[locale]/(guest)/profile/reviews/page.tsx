"use client";

import React from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileReviewsTab } from "@/components/profile/ProfileReviewsTab";

export default function ProfileReviewsPage() {
  return (
    <ProfileLayoutWrapper>
      <ProfileReviewsTab />
    </ProfileLayoutWrapper>
  );
}
