"use client";

import { useMemo, useState } from "react";

export interface UsePaginationOptions<T = unknown> {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  items?: T[];
}

export interface UsePaginationReturn<T = unknown> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageNumbers: (number | "...")[];
  currentItems?: T[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T = unknown>({
  totalItems,
  pageSize = 32,
  initialPage = 1,
  currentPage: controlledPage,
  onPageChange,
  siblingCount = 1,
  items,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [internalPage, setInternalPage] = useState(initialPage);

  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const setPage = (page: number) => {
    const validPage = Math.min(Math.max(1, page), totalPages);
    if (!isControlled) {
      setInternalPage(validPage);
    }
    if (onPageChange && validPage !== currentPage) {
      onPageChange(validPage);
    }
  };

  const nextPage = () => setPage(currentPage + 1);
  const prevPage = () => setPage(currentPage - 1);

  // Calculate items slice indices
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const currentItems = useMemo(() => {
    if (!items) return undefined;
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Generate page numbers with ellipses
  const pageNumbers = useMemo<(number | "...")[]>(() => {
    // Total page numbers to show = siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    // Case 1: If total pages is less than the page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots needed
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    // Case 3: No right dots, but left dots needed
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1,
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    // Case 4: Both left and right dots needed
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages, siblingCount, currentPage]);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    pageNumbers,
    currentItems,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    goToPage: setPage,
    nextPage,
    prevPage,
  };
}
