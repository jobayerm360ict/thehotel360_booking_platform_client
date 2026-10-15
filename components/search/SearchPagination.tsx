"use client";

import React from "react";
import { AppPagination, AppPaginationProps } from "@/components/common/AppPagination";

export type SearchPaginationProps = AppPaginationProps;

export function SearchPagination(props: SearchPaginationProps) {
  return <AppPagination {...props} />;
}
