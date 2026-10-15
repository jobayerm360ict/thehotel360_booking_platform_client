"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-xs",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  src,
  alt = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = React.useState(!src);

  React.useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) return null;

  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-brand-secondary text-white font-sans font-semibold text-xs",
        className
      )}
      {...props}
    />
  );
}
