"use client";

import * as React from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLabel: string;
  setSelectedLabel: React.Dispatch<React.SetStateAction<string>>;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(
  undefined,
);

export function Select({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState("");

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = React.useCallback(
    (newVal: string) => {
      if (value === undefined) {
        setInternalValue(newVal);
      }
      onValueChange?.(newVal);
      setOpen(false);
    },
    [value, onValueChange],
  );

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      <div className={cn("relative block text-left w-full", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  disabled = false,
}: {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        // Handled by content click outside
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <button
      ref={triggerRef}
      disabled={disabled}
      type="button"
      onClick={() => context.setOpen((prev) => !prev)}
      className={cn(
        "flex w-full items-center justify-between gap-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-700/90 bg-white dark:bg-neutral-900 px-4 py-2.5 text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 cursor-pointer",
        className,
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0",
          context.open && "rotate-180 text-brand-primary",
        )}
      />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  return (
    <span className="truncate">
      {context.selectedLabel || placeholder || context.value}
    </span>
  );
}

export function SelectContent({
  className,
  children,
  align = "start",
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

  const { open, setOpen } = context;
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-3 w-full min-w-[190px] rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150",
        align === "end"
          ? "right-0"
          : align === "center"
            ? "left-1/2 -translate-x-1/2"
            : "left-0",
        className,
      )}
    >
      <div className="space-y-0.5 max-h-60 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  const isSelected = context.value === value;

  React.useEffect(() => {
    if (isSelected && typeof children === "string") {
      context.setSelectedLabel(children);
    }
  }, [isSelected, children, context]);

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof children === "string") {
          context.setSelectedLabel(children);
        }
        context.onValueChange(value);
      }}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-sans font-medium transition-all duration-150 text-left cursor-pointer",
        isSelected
          ? "bg-brand-primary-light/60 dark:bg-neutral-800 text-brand-primary dark:text-rose-300 font-semibold"
          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white",
        className,
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <Check className="h-3.5 w-3.5 text-brand-primary ml-2 shrink-0 stroke-[2.5]" />
      )}
    </button>
  );
}

/* =========================================================================
   SELECT FIELD (With Label, Icons, Error & Helper text, Shadcn UI styling)
   ========================================================================= */
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  helperText,
  required,
  leftIcon,
  className,
  containerClassName,
  disabled = false,
}: SelectFieldProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("space-y-2 w-full text-left", containerClassName)}>
      {label && (
        <label className="text-xs font-sans font-medium text-neutral-600 dark:text-neutral-300 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <Select value={value} onValueChange={(val) => onChange?.(val)}>
        <SelectTrigger
          className={cn(
            "w-full h-11 rounded-xl border border-neutral-200/90 dark:border-neutral-700/90 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm font-sans font-medium text-neutral-900 dark:text-white shadow-2xs hover:border-neutral-300 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200",
            error &&
              "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            {leftIcon && (
              <span className="text-brand-primary shrink-0 flex items-center [&_svg]:text-brand-primary">
                {leftIcon}
              </span>
            )}
            <span
              className={cn(
                "truncate",
                !selectedOption &&
                  "text-neutral-400 dark:text-neutral-500 font-normal",
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        </SelectTrigger>

        <SelectContent className="w-full min-w-[200px] rounded-xl p-1.5 border border-neutral-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900 z-50">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="rounded-xl"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-[11px] font-sans text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p className="text-[11px] font-serif text-neutral-400 dark:text-neutral-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
