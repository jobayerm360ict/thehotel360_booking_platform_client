"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HostLayoutWrapper } from "@/components/host/HostLayoutWrapper";
import { InventoryCalendar } from "@/components/host/room-types/InventoryCalendar";
import { RoomTypeForm } from "@/components/host/room-types/RoomTypeForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateRoomType } from "@/store/slices/roomTypesSlice";
import { CreateRoomTypeDTO, RoomType } from "@/types";
import { toast } from "sonner";

export default function HostEditRoomTypePage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roomTypeId = Number(params?.id);
  const roomTypes = useAppSelector((state) => state.roomTypes.items);
  const existingRoomType = roomTypes.find((rt) => rt.id === roomTypeId);

  const handleSubmit = async (data: CreateRoomTypeDTO) => {
    if (!existingRoomType) return;
    setIsSubmitting(true);
    try {
      const updated: RoomType = {
        ...existingRoomType,
        ...data,
        photos: data.photos?.map((p, idx) => ({
          id: idx + 1,
          url: typeof p === "string" ? p : typeof p === "object" && "url" in p ? p.url : "",
        })).filter((p) => Boolean(p.url)),
        updated_at: new Date().toISOString(),
      };

      await dispatch(updateRoomType({ ...data, id: updated.id })).unwrap();
      toast.success("Room type updated successfully!");

      router.push("/host/room-types");
    } catch {
      toast.error("Failed to update room type.");
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
                Edit Room Type
              </h1>
              <p className="text-xs text-neutral-500 font-serif">
                Modify space configuration, pricing, or room amenities.
              </p>
            </div>
          </div>
        </div>

        {existingRoomType ? (
          <><InventoryCalendar roomId={roomTypeId} />
          <RoomTypeForm
            initialData={existingRoomType}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => router.push("/host/room-types")}
          />
          </>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200/80 dark:border-neutral-800">
            <p className="text-sm font-sans font-medium text-neutral-600">
              Room type not found.
            </p>
            <Link
              href="/host/room-types"
              className="mt-3 inline-block text-xs font-sans font-semibold text-brand-primary hover:underline"
            >
              Back to Room Types
            </Link>
          </div>
        )}
      </div>
    </HostLayoutWrapper>
  );
}
