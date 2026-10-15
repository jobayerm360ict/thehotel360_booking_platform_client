"use client";

import React from "react";
import { GuestChatView } from "@/components/messages/GuestChatView";

export function ProfileMessagesTab() {
  return (
    <div className="space-y-4 animate-fade-in">
      <GuestChatView />
    </div>
  );
}
