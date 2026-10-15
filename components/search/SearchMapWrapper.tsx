"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Listing } from "@/types";
import { MapBounds } from "./SearchMap";
import { Loader2 } from "lucide-react";

const SearchMap = dynamic(
  () => import("./SearchMap").then((mod) => mod.SearchMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 text-neutral-500 shadow-sm animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        <span className="text-xs font-sans font-semibold">
          Loading interactive map…
        </span>
      </div>
    ),
  }
);

interface SearchMapWrapperProps {
  items: Listing[];
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  hoveredId: string | null;
  selectedId: string | null;
  onHoverItem: (id: string | null) => void;
  onSelectItem: (id: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  searchOnMove: boolean;
  onToggleSearchOnMove: (checked: boolean) => void;
  onRetry?: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function SearchMapWrapper(props: SearchMapWrapperProps) {
  return <SearchMap {...props} />;
}
