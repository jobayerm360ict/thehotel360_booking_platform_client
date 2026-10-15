"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BedDouble, Sparkles } from "lucide-react";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { RoomTypeForm } from "@/components/host/room-types/RoomTypeForm";
import { useAppDispatch } from "@/store/hooks";
import { addRoomType } from "@/store/slices/roomTypesSlice";
import { CreateRoomTypeDTO, RoomType } from "@/types";
import { toast } from "sonner";

export default function HostCreateRoomTypePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateRoomTypeDTO) => {
    setIsSubmitting(true);
    try {
      await dispatch(addRoomType(data)).unwrap();
      toast.success("Room type created successfully!");

      router.push("/host/room-types");
    } catch {
      toast.error("Failed to create room type. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HostLayoutWrapper>
      <div className="space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <Link
              href="/host/room-types"
              className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-brand-primary transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Add New Room Type
              </h1>
            </div>
          </div>
        </div>

        {/* Room Type Form */}
        <RoomTypeForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/host/room-types")}
        />
      </div>
    </HostLayoutWrapper>
  );
}
