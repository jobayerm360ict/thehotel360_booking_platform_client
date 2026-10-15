"use client";

import React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans group-[.toaster]:bg-white/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-neutral-900 group-[.toaster]:border-neutral-200/80 group-[.toaster]:shadow-xl dark:group-[.toaster]:bg-neutral-900/95 dark:group-[.toaster]:text-neutral-100 dark:group-[.toaster]:border-neutral-800 rounded-2xl",
          description:
            "group-[.toast]:text-neutral-500 dark:group-[.toast]:text-neutral-400 font-sans",
          actionButton:
            "group-[.toast]:bg-brand-primary group-[.toast]:text-white font-medium rounded-xl",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-600 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-300 rounded-xl",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-emerald-950 dark:group-[.toaster]:text-emerald-100",
          error:
            "group-[.toaster]:border-rose-500/30 group-[.toaster]:text-rose-950 dark:group-[.toaster]:text-rose-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
