"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(
  undefined
);

export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const nextOpen = typeof value === "function" ? value(open) : value;
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, open, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
  className,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  const { open, setOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    setOpen((prev) => !prev);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        setOpen((prev) => !prev);
      },
      "aria-expanded": open,
      className: cn(child.props.className, className),
    });
  }

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 8,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end" | "center";
  sideOffset?: number;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

  const { open, setOpen } = context;
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        const trigger = contentRef.current.parentElement;
        if (trigger && !trigger.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="menu"
      style={{ marginTop: `${sideOffset}px` }}
      className={cn(
        "absolute z-50 min-w-[18rem] rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150",
        align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  asChild,
  className,
  inset,
  children,
  onClick,
  ...props
}: {
  asChild?: boolean;
  inset?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e as React.MouseEvent<HTMLDivElement>);
    context?.setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(child, {
      role: "menuitem",
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        handleClick(e);
      },
      className: cn(
        "relative flex cursor-pointer select-none items-center outline-none transition-colors focus:bg-neutral-50 focus:text-neutral-900",
        inset && "pl-8",
        child.props.className,
        className
      ),
    });
  }

  return (
    <div
      role="menuitem"
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-xl px-5 py-2.5 text-sm font-serif text-neutral-700 outline-none transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-50 focus:text-neutral-900",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  inset?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-5 py-3 border-b border-neutral-100 dark:border-neutral-800",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("my-1 h-px bg-neutral-100 dark:bg-neutral-800", className)}
      {...props}
    />
  );
}

export function DropdownMenuGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-2", className)} {...props} />;
}
