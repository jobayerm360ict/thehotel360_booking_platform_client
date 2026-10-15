"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
  Edit2,
  Trash2,
  Sparkles,
  Home,
  CheckCircle2,
} from "lucide-react";
import { RoomType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popconfirm } from "@/components/ui/popconfirm";

interface RoomTypeCardProps {
  roomType: RoomType;
  onEdit?: (roomType: RoomType) => void;
  onDelete?: (id: number) => void;
  onSelect?: (roomType: RoomType) => void;
  selected?: boolean;
}

export function RoomTypeCard({
  roomType,
  onEdit,
  onDelete,
  onSelect,
  selected = false,
}: RoomTypeCardProps) {
  const coverPhoto =
    roomType.photos && roomType.photos.length > 0
      ? roomType.photos[0].url
      : "/app.svg";

  const spaceTypeLabels: Record<string, string> = {
    entire_place: "Entire Place",
    private_room: "Private Room",
    shared_room: "Shared Room",
  };

  return (
    <div
      onClick={() => onSelect && onSelect(roomType)}
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden bg-white dark:bg-neutral-900 flex flex-col justify-between ${
        selected
          ? "border-brand-primary ring-2 ring-brand-primary/20 shadow-md"
          : "border-neutral-200/80 dark:border-neutral-800 hover:border-brand-primary/40 hover:shadow-md"
      }`}
    >
      <div>
        {/* Photo Thumbnail Banner */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={coverPhoto}
            alt={roomType.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Space Type Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge className="bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white backdrop-blur-md border-none text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              <Home className="w-3 h-3 text-brand-primary mr-1" />
              <span>
                {spaceTypeLabels[roomType.space_type] || roomType.space_type}
              </span>
            </Badge>

            {roomType.status === "active" ? (
              <Badge className="bg-emerald-500/90 text-white border-none text-[9px] font-sans font-bold px-2 py-0.5 rounded-full">
                Active
              </Badge>
            ) : (
              <Badge className="bg-amber-500/90 text-white border-none text-[9px] font-sans font-bold px-2 py-0.5 rounded-full">
                Draft
              </Badge>
            )}
          </div>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 left-3 text-white">
            <span className="font-heading font-extrabold text-lg sm:text-xl drop-shadow-sm">
              {formatPrice(roomType.base_price)}
            </span>
            <span className="text-[11px] font-sans opacity-90 ml-1">
              / night
            </span>
          </div>

          {/* Selected indicator */}
          {selected && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="font-heading font-bold text-base text-neutral-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
              {roomType.name}
            </h3>
          </div>

          {/* Metric Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-sans text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/80">
              <Users className="w-3 h-3 text-brand-primary" />
              <span>{roomType.max_adults} Adults</span>
              {roomType.max_childrens > 0 && (
                <span>, {roomType.max_childrens} Ch</span>
              )}
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/80">
              <Bed className="w-3 h-3 text-brand-primary" />
              <span>
                {roomType.bed_count} {roomType.bed_count > 1 ? "Beds" : "Bed"}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/80">
              <Bath className="w-3 h-3 text-brand-primary" />
              <span>{roomType.bathroom_count} Bath</span>
            </div>

            {roomType.area > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/80">
                <Maximize2 className="w-3 h-3 text-brand-primary" />
                <span>{roomType.area} sq ft</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {(onEdit || onDelete) && (
        <div className="px-4 py-3 bg-neutral-50/70 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[150px]">
            slug: {roomType.slug}
          </span>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(roomType);
                }}
                className="h-7.5 px-2.5 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-300 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition cursor-pointer shadow-2xs gap-1.5"
                title="Edit Room Type"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
            )}

            {onDelete && (
              <Popconfirm
                title="Delete this room type?"
                description={`Are you sure you want to delete "${roomType.name}"? This action cannot be undone.`}
                okText="Delete"
                cancelText="Cancel"
                okVariant="destructive"
                onConfirm={() => onDelete(roomType.id)}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7.5 px-2.5 text-xs font-sans font-semibold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 hover:border-rose-300 transition cursor-pointer shadow-2xs gap-1.5"
                  title="Delete Room Type"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete</span>
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
