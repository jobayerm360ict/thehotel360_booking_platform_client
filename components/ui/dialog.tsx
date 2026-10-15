"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 pointer-events-none"
        aria-hidden="true"
      />

      {/* Modal Dialog Content Container */}
      <div className="relative z-[99999] w-full flex items-center justify-center pointer-events-none my-auto max-h-full">
        <div className="pointer-events-auto w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg rounded-3xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 dark:bg-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-800 overflow-hidden",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer z-30"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-heading font-semibold leading-tight text-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-serif text-neutral-500 dark:text-neutral-400", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 border-t border-neutral-100 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  );
}
