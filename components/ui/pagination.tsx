import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center select-none", className)}
      {...props}
    />
  );
}

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1.5 sm:gap-2", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<"button">;

function PaginationLink({
  className,
  isActive,
  disabled,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-xs font-sans font-semibold transition-all duration-200 cursor-pointer h-9 w-9 sm:h-10 sm:w-10 outline-none",
        isActive
          ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25 border border-brand-primary scale-105"
          : "border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95",
        disabled && "opacity-40 pointer-events-none cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  label = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn(
        "h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-2xs hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  label = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn(
        "h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-2xs hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100",
        className,
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-neutral-400 dark:text-neutral-500",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
