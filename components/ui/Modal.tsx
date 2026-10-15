"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Re-export standard Dialog primitives for direct flexibility
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-[96vw] max-h-[96vh] h-full",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  headerContent,
  footerContent,
  children,
  size = "lg",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  className,
  bodyClassName,
  headerClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and attach ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!mounted || !isOpen) return null;

  const hasHeader = Boolean(title || description || icon || headerContent);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto"
      onClick={() => {
        if (closeOnBackdropClick) {
          onClose();
        }
      }}
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 pointer-events-none"
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          "relative z-[99999] w-full rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden my-auto",
          SIZE_CLASSES[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-white dark:hover:bg-neutral-800 transition active:scale-95 cursor-pointer z-40"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Custom Header or Default Header */}
        {headerContent ? (
          headerContent
        ) : hasHeader ? (
          <div
            className={cn(
              "p-6 sm:p-7 pb-4 border-b border-neutral-100 dark:border-neutral-800",
              headerClassName
            )}
          >
            <div className="flex items-start gap-3.5">
              {icon && (
                <div className="w-12 h-12 rounded-2xl bg-brand-primary-light dark:bg-rose-950/40 text-brand-primary flex items-center justify-center shrink-0 shadow-2xs">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="font-heading font-semibold text-xl text-neutral-900 dark:text-white leading-snug">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="font-serif text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Modal Body */}
        <div className={cn("p-6 sm:p-7 overflow-y-auto no-scrollbar max-h-[calc(90vh-8rem)]", bodyClassName)}>
          {children}
        </div>

        {/* Modal Footer */}
        {footerContent && (
          <div className="p-4 sm:p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 flex items-center justify-end gap-3">
            {footerContent}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
