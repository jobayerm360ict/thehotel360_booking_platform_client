"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PopconfirmProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okVariant?: "destructive" | "default";
  icon?: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  placement?: "top" | "bottom";
  className?: string;
}

export function Popconfirm({
  title = "Are you sure?",
  description,
  onConfirm,
  onCancel,
  okText = "Delete",
  cancelText = "Cancel",
  okVariant = "destructive",
  icon = <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
  children,
  placement = "top",
  className,
}: PopconfirmProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
    transform: string;
  }>({ top: 0, left: 0, transform: "none" });

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const popupRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const spaceAbove = rect.top;
    const isTop = placement === "top" || spaceAbove > 150;

    if (isTop) {
      setCoords({
        top: rect.top + scrollY - 8,
        left: rect.right + scrollX,
        transform: "translate(-100%, -100%)",
      });
    } else {
      setCoords({
        top: rect.bottom + scrollY + 8,
        left: rect.right + scrollX,
        transform: "translate(-100%, 0)",
      });
    }
  }, [placement]);

  React.useEffect(() => {
    if (!open) return;

    updatePosition();
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
        onCancel?.();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onCancel?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, updatePosition, onCancel]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  const handleConfirmClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
    await onConfirm();
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
    onCancel?.();
  };

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="inline-flex items-center"
      >
        {children}
      </span>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.transform,
              zIndex: 999999,
            }}
            className={cn(
              "w-72 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150",
              className
            )}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-heading font-bold text-neutral-900 dark:text-white leading-tight">
                  {title}
                </h4>
                {description && (
                  <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 leading-normal">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCancelClick}
                className="h-7 px-2.5 text-xs font-sans text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={okVariant}
                size="xs"
                onClick={handleConfirmClick}
                className="h-7 px-3 text-xs font-sans font-semibold shadow-xs"
              >
                {okText}
              </Button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
