"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

export interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
  showItemCount?: boolean;
  className?: string;
  itemLabel?: string;
}

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 32,
  siblingCount = 1,
  showItemCount = false,
  className,
  itemLabel = "items",
}: AppPaginationProps) {
  // If there is only 1 page or less, do not render pagination
  if (totalPages <= 1) return null;

  // Use the pagination hook to get formatted page numbers with ellipses
  const { pageNumbers, hasPrevPage, hasNextPage } = usePagination({
    totalItems: totalItems ?? totalPages * pageSize,
    pageSize,
    currentPage,
    onPageChange,
    siblingCount,
  });

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = totalItems
    ? Math.min(currentPage * pageSize, totalItems)
    : currentPage * pageSize;

  return (
    <div className={cn("py-10 flex flex-col items-center justify-center gap-3 select-none", className)}>
      <Pagination>
        <PaginationContent>
          {/* Previous Page Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!hasPrevPage}
            />
          </PaginationItem>

          {/* Page Numbers & Ellipses */}
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={isActive}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next Page Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={!hasNextPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Optional Item Count Info */}
      {showItemCount && totalItems !== undefined && (
        <p className="text-xs font-sans text-neutral-400 dark:text-neutral-500">
          Showing <span className="font-semibold text-neutral-700 dark:text-neutral-300">{startIndex}–{endIndex}</span> of{" "}
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">{totalItems}</span> {itemLabel}
        </p>
      )}
    </div>
  );
}
