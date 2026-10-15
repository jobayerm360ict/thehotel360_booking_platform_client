"use client";

import React from "react";
import { ProfileLayoutWrapper } from "@/components/profile/ProfileLayoutWrapper";
import { ProfileWishlistTab } from "@/components/profile/ProfileWishlistTab";

export default function ProfileWishlistPage() {
  return (
    <ProfileLayoutWrapper>
      <ProfileWishlistTab />
    </ProfileLayoutWrapper>
  );
}
