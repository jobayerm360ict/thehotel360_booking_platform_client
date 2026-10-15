"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteRoomType } from "@/store/slices/roomTypesSlice";
import { RoomType, SpaceType } from "@/types";
import { RoomTypeCard } from "./RoomTypeCard";
import { SearchInput } from "@/components/common/InputFields";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function RoomTypeList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roomTypes = useAppSelector((state) => state.roomTypes.items);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpaceType, setSelectedSpaceType] = useState<string>("all");

  const filteredRoomTypes = roomTypes.filter((rt) => {
    const matchesSearch =
      rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rt.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpace =
      selectedSpaceType === "all" || rt.space_type === selectedSpaceType;

    return matchesSearch && matchesSpace;
  });

  const handleDelete = async (id: number) => {
    try { await dispatch(deleteRoomType(id)).unwrap(); toast.success("Room type deleted successfully."); } catch { /* API error toast */ }
  };

  const handleEdit = (rt: RoomType) => {
    router.push(`/host/room-types/${rt.id}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Room Types &amp; Suites
            </h1>
            <Badge className="bg-brand-primary/10 text-brand-primary border-none text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {roomTypes.length} Configured
            </Badge>
          </div>
        </div>

        <Link
          href="/host/room-types/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs hover:shadow-md transition active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room Type</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Search room types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        {/* Space Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 self-start sm:self-auto overflow-x-auto">
          {[
            { id: "all", label: "All Types" },
            { id: "entire_place", label: "Entire Place" },
            { id: "private_room", label: "Private Room" },
            { id: "shared_room", label: "Shared Room" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedSpaceType(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer shrink-0 ${
                selectedSpaceType === pill.id
                  ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Types Grid */}
      {filteredRoomTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoomTypes.map((rt) => (
            <RoomTypeCard
              key={rt.id}
              roomType={rt}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto shadow-2xs">
            <BedDouble className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
              No Room Types Found
            </h3>
            <p className="text-xs font-serif text-neutral-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? "No room types match your current search criteria."
                : "Get started by adding your first room type with capacity, beds, and amenities."}
            </p>
          </div>
          <Link
            href="/host/room-types/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-primary text-white text-xs font-sans font-semibold hover:bg-brand-primary-hover shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Room Type</span>
          </Link>
        </div>
      )}
    </div>
  );
}
