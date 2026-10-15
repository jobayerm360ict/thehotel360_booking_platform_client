"use client";

import React from "react";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { RoomTypeList } from "@/components/host/room-types/RoomTypeList";

export default function HostRoomTypesPage() {
  return (
    <HostLayoutWrapper>
      <div className="space-y-6 animate-fade-in">
        <RoomTypeList />
      </div>
    </HostLayoutWrapper>
  );
}
