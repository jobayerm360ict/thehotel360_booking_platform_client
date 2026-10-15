"use client";

import * as React from "react";
import {
  Eye,
  EyeOff,
  X,
  Search,
  Check,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Lock,
  User,
  MapPin,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import * as Flags from "country-flag-icons/react/3x2";

/* =========================================================================
   1. BASE RAW INPUT (Standard Shadcn Primitive)
   ========================================================================= */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-2.5 text-sm font-sans font-medium text-neutral-900 shadow-2xs placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700/90 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 transition-all duration-200",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

/* =========================================================================
   2. BASE RAW TEXTAREA (Standard Shadcn Primitive)
   ========================================================================= */
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border border-neutral-200/90 bg-white px-4 py-3 text-sm font-sans font-normal text-neutral-900 shadow-2xs placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700/90 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 transition-all duration-200 resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

/* =========================================================================
   3. UNIVERSAL INPUT FIELD (With Label, Icons, Error & Helper text)
   ========================================================================= */
export interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
  containerClassName?: string;
  onClear?: () => void;
  clearable?: boolean;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      leftIcon,
      rightIcon,
      error,
      helperText,
      prefix,
      suffix,
      className,
      containerClassName,
      required,
      id,
      value,
      onClear,
      clearable,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("space-y-2 w-full text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between text-xs font-sans font-medium text-neutral-600 dark:text-neutral-300"
          >
            <span>
              {label} {required && <span className="text-rose-500">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary shrink-0 flex items-center pointer-events-none z-10 [&_svg]:text-brand-primary">
              {leftIcon}
            </div>
          )}

          {prefix && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-brand-primary select-none z-10">
              {prefix}
            </span>
          )}

          <Input
            id={inputId}
            ref={ref}
            value={value}
            disabled={disabled}
            className={cn(
              "w-full h-11 rounded-xl border border-neutral-200/90 dark:border-neutral-700/90 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm font-sans font-medium text-neutral-900 dark:text-white shadow-2xs placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-all duration-200",
              (leftIcon || prefix) && "pl-10",
              (rightIcon || suffix || clearable) && "pr-10",
              error &&
                "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500",
              className,
            )}
            {...props}
          />

          {suffix && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-neutral-400 select-none z-10">
              {suffix}
            </span>
          )}

          {clearable && value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {rightIcon && !clearable && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 shrink-0 flex items-center z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-sans text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] font-sans text-neutral-400 dark:text-neutral-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
InputField.displayName = "InputField";

/* =========================================================================
   4. PASSWORD INPUT FIELD (With Show/Hide Password toggle)
   ========================================================================= */
export const PasswordInputField = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "type" | "rightIcon">
>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <InputField
      ref={ref}
      type={showPassword ? "text" : "password"}
      leftIcon={props.leftIcon || <Lock className="w-4 h-4 text-brand-primary" />}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary cursor-pointer transition p-1"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      }
      {...props}
    />
  );
});
PasswordInputField.displayName = "PasswordInputField";

/* =========================================================================
   5. EMAIL INPUT FIELD (Universal with Mail Icon)
   ========================================================================= */
export const EmailInputField = React.forwardRef<
  HTMLInputElement,
  InputFieldProps
>((props, ref) => {
  return (
    <InputField
      ref={ref}
      type="email"
      leftIcon={props.leftIcon || <Mail className="w-4 h-4 text-brand-primary" />}
      placeholder={props.placeholder || "example@domain.com"}
      {...props}
    />
  );
});
EmailInputField.displayName = "EmailInputField";

/* =========================================================================
   5. TEXTAREA FIELD (With Label, Error & Helper text)
   ========================================================================= */
export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      className,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("space-y-2 w-full text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-sans font-medium text-neutral-600 dark:text-neutral-300 block"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <Textarea
          id={inputId}
          ref={ref}
          className={cn(
            error &&
              "border-rose-400 focus-visible:ring-rose-500/20 focus-visible:border-rose-500",
            className,
          )}
          {...props}
        />

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
  },
);
TextareaField.displayName = "TextareaField";

/* =========================================================================
   6. CURRENCY / PRICE INPUT (With Currency Prefix & Formatting)
   ========================================================================= */
export interface CurrencyInputProps extends Omit<
  InputFieldProps,
  "type" | "prefix"
> {
  currencySymbol?: string;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(({ currencySymbol = "$", leftIcon, ...props }, ref) => {
  return (
    <InputField
      ref={ref}
      type="number"
      leftIcon={
        leftIcon || (
          <span className="text-xs font-bold font-sans text-brand-primary">
            {currencySymbol}
          </span>
        )
      }
      {...props}
    />
  );
});
CurrencyInput.displayName = "CurrencyInput";

/* =========================================================================
   7. SHADCN DATE PICKER FIELD (With Calendar Popover & Fast Month/Year Picker)
   ========================================================================= */
export { DatePickerField, DateInputField } from "./date-picker";
export type { DatePickerFieldProps } from "./date-picker";

/* =========================================================================
   8. SHADCN SELECT FIELD & COMPONENTS (Universal Dropdowns)
   ========================================================================= */
export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectField,
} from "./select";
export type { SelectFieldProps, SelectOption } from "./select";

/* =========================================================================
   9. PHONE INPUT FIELD (With 240+ Countries, SVG Flags & Dial Code Dropdown)
   ========================================================================= */
export interface CountryOption {
  name: string;
  code: string;
  dialCode: string;
}

// Generate all 240+ countries dynamically from libphonenumber data
const allIsoCodes = getCountries();
export const COUNTRY_PHONE_LIST: CountryOption[] = allIsoCodes
  .map((code) => ({
    code,
    name: (en as Record<string, string>)[code] || code,
    dialCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => {
    // Put Bangladesh, USA, UK, UAE, Saudi Arabia, India at the top
    const priority = [
      "BD",
      "US",
      "GB",
      "AE",
      "SA",
      "IN",
      "CA",
      "AU",
      "SG",
      "MY",
    ];
    const aIdx = priority.indexOf(a.code);
    const bIdx = priority.indexOf(b.code);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

function RenderCountryFlag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const FlagComp = (
    Flags as Record<string, React.ComponentType<{ className?: string }>>
  )[code.toUpperCase()];
  if (!FlagComp) {
    return (
      <span className="w-5 h-3.5 bg-neutral-200 dark:bg-neutral-700 text-[9px] font-bold flex items-center justify-center rounded-xs text-neutral-600 dark:text-neutral-300 shrink-0">
        {code}
      </span>
    );
  }
  return (
    <FlagComp
      className={cn(
        "w-5 h-3.5 rounded-xs object-cover shadow-2xs shrink-0",
        className,
      )}
    />
  );
}

export interface PhoneInputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  leftIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  defaultCountryCode?: string; // ISO code like "BD" or dialCode like "+880"
  selectedCountry?: CountryOption;
  onCountryChange?: (country: CountryOption) => void;
}

export const PhoneInputField = React.forwardRef<
  HTMLInputElement,
  PhoneInputFieldProps
>(
  (
    {
      label,
      leftIcon,
      error,
      helperText,
      required,
      className,
      containerClassName,
      id,
      value,
      onChange,
      disabled,
      placeholder,
      defaultCountryCode = "BD",
      selectedCountry: externalCountry,
      onCountryChange,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const [country, setCountry] = React.useState<CountryOption>(() => {
      if (externalCountry) return externalCountry;
      const found = COUNTRY_PHONE_LIST.find(
        (c) =>
          c.code.toUpperCase() === defaultCountryCode.toUpperCase() ||
          c.dialCode === defaultCountryCode,
      );
      return found || COUNTRY_PHONE_LIST[0];
    });

    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Sync external country if controlled
    React.useEffect(() => {
      if (externalCountry) {
        setCountry(externalCountry);
      }
    }, [externalCountry]);

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const filteredCountries = React.useMemo(() => {
      if (!searchQuery.trim()) return COUNTRY_PHONE_LIST;
      const q = searchQuery.toLowerCase().trim();
      return COUNTRY_PHONE_LIST.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.dialCode.includes(q),
      );
    }, [searchQuery]);

    const handleSelectCountry = (c: CountryOption) => {
      setCountry(c);
      setIsOpen(false);
      setSearchQuery("");
      if (onCountryChange) {
        onCountryChange(c);
      }
    };

    return (
      <div className={cn("space-y-2 w-full text-left", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center justify-between text-xs font-sans font-medium text-neutral-600 dark:text-neutral-300"
          >
            <span>
              {label} {required && <span className="text-rose-500">*</span>}
            </span>
          </label>
        )}

        <div
          ref={dropdownRef}
          className={cn(
            "relative flex items-center h-11 border rounded-xl bg-white dark:bg-neutral-800 transition-all duration-200 shadow-2xs",
            error
              ? "border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500"
              : "border-neutral-200/90 dark:border-neutral-700/90 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary",
            disabled &&
              "opacity-60 bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed",
          )}
        >
          {/* Optional custom Left Icon */}
          {leftIcon && (
            <div className="pl-3.5 text-brand-primary shrink-0 flex items-center [&_svg]:text-brand-primary">
              {leftIcon}
            </div>
          )}

          {/* Country Code & SVG Flag Trigger */}
          <div className="relative shrink-0 h-full">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-3.5 pr-2.5 h-full text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-l-xl transition cursor-pointer select-none border-r border-neutral-200/80 dark:border-neutral-700"
              title={`${country.name} (${country.dialCode})`}
            >
              <RenderCountryFlag code={country.code} />
              <span className="font-sans text-neutral-800 dark:text-neutral-100 font-semibold text-xs">
                {country.dialCode}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-brand-primary transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {/* Country Selector Dropdown Popover */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 max-h-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Search Box */}
                <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/70">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-brand-primary absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 240+ countries or code..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                {/* List of 240+ Countries with SVG Flags */}
                <div className="overflow-y-auto max-h-64 p-1.5 divide-y divide-neutral-50 dark:divide-neutral-800/40 scrollbar-thin">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 font-sans">
                      No country found for &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredCountries.map((c) => {
                      const isSelected = c.code === country.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleSelectCountry(c)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-xs font-sans rounded-xl transition cursor-pointer text-left",
                            isSelected
                              ? "bg-brand-primary/10 text-brand-primary font-semibold"
                              : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200",
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <RenderCountryFlag code={c.code} />
                            <span className="truncate">{c.name}</span>
                          </div>
                          <span className="font-mono text-neutral-400 dark:text-neutral-500 text-[11px] shrink-0 ml-2">
                            {c.dialCode}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Phone Number Input */}
          <input
            id={inputId}
            ref={ref}
            type="tel"
            value={value}
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder || "Enter phone number"}
            className={cn(
              "w-full h-full bg-transparent px-3.5 py-2.5 text-sm font-sans font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="text-[11px] font-sans text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] font-sans text-neutral-400 dark:text-neutral-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
PhoneInputField.displayName = "PhoneInputField";

/* =========================================================================
   10. SEARCH INPUT (With Search Icon & Clear button)
   ========================================================================= */
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "type">
>(({ className, containerClassName, leftIcon, ...props }, ref) => {
  return (
    <InputField
      ref={ref}
      type="text"
      leftIcon={leftIcon || <Search className="w-4 h-4 text-brand-primary" />}
      clearable
      containerClassName={containerClassName}
      className={cn("rounded-xl", className)}
      {...props}
    />
  );
});
SearchInput.displayName = "SearchInput";

/* =========================================================================
   10. CHECKBOX FIELD (Custom Luxury Checkbox with Label & Subtitle)
   ========================================================================= */
export interface CheckboxFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  description?: string;
  containerClassName?: string;
}

export const CheckboxField = React.forwardRef<
  HTMLInputElement,
  CheckboxFieldProps
>(
  (
    { label, description, checked, onChange, containerClassName, ...props },
    ref,
  ) => {
    return (
      <label
        className={cn(
          "flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
          checked
            ? "border-brand-primary bg-brand-primary-light/40 dark:bg-neutral-800"
            : "border-neutral-200/90 dark:border-neutral-700/90 hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
          containerClassName,
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200",
              checked
                ? "bg-brand-primary border-brand-primary text-white shadow-xs"
                : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800",
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200">
            {label}
          </span>
          {description && (
            <span className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </label>
    );
  },
);
CheckboxField.displayName = "CheckboxField";

/* =========================================================================
   11. SWITCH TOGGLE FIELD (Modern Switch with Label & Subtitle)
   ========================================================================= */
export interface SwitchFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  description?: string;
  containerClassName?: string;
}

export const SwitchField = React.forwardRef<HTMLInputElement, SwitchFieldProps>(
  (
    { label, description, checked, onChange, containerClassName, ...props },
    ref,
  ) => {
    return (
      <label
        className={cn(
          "flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-700 transition cursor-pointer select-none",
          containerClassName,
        )}
      >
        <div className="flex flex-col text-left pr-4">
          <span className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200">
            {label}
          </span>
          {description && (
            <span className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 mt-0.5">
              {description}
            </span>
          )}
        </div>

        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out p-0.5",
              checked
                ? "bg-brand-primary"
                : "bg-neutral-300 dark:bg-neutral-700",
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                checked ? "translate-x-5" : "translate-x-0",
              )}
            />
          </div>
        </div>
      </label>
    );
  },
);
SwitchField.displayName = "SwitchField";

/* =========================================================================
   14. 6-DIGIT OTP INPUT (Symmetric, 6 Individual Boxes, Auto-Advance, Paste)
   ========================================================================= */
export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      length = 6,
      value = "",
      onChange,
      error,
      disabled = false,
      className,
      autoFocus = true,
    },
    ref,
  ) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const digits = React.useMemo(() => {
      const arr = new Array(length).fill("");
      for (let i = 0; i < length; i++) {
        arr[i] = value[i] || "";
      }
      return arr;
    }, [value, length]);

    React.useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    const handleChange = (
      index: number,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const val = e.target.value.replace(/\D/g, "");
      if (!val) {
        return;
      }
      const char = val[val.length - 1];
      const newDigits = [...digits];
      newDigits[index] = char;
      const combined = newDigits.join("");
      onChange(combined);

      // Auto-advance to next box
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace") {
        if (!digits[index] && index > 0) {
          const newDigits = [...digits];
          newDigits[index - 1] = "";
          onChange(newDigits.join(""));
          inputRefs.current[index - 1]?.focus();
        } else {
          const newDigits = [...digits];
          newDigits[index] = "";
          onChange(newDigits.join(""));
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text/plain")
        .trim()
        .replace(/\D/g, "");
      if (!pastedData) return;
      const slice = pastedData.slice(0, length);
      onChange(slice);
      const nextIndex = Math.min(slice.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    };

    return (
      <div
        ref={ref}
        className={cn("w-full flex flex-col items-center gap-2", className)}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
          {Array.from({ length }).map((_, index) => {
            const isFilled = Boolean(digits[index]);
            return (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digits[index]}
                disabled={disabled}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={cn(
                  "w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-xl border transition-all duration-200 outline-none select-none",
                  "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs",
                  isFilled
                    ? "border-brand-primary bg-brand-primary-light/40 dark:bg-brand-primary/10 ring-1 ring-brand-primary/30"
                    : "border-neutral-200/90 dark:border-neutral-700/90 hover:border-neutral-300 dark:hover:border-neutral-600",
                  "focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 dark:focus:ring-brand-primary/25",
                  error &&
                    "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15 text-rose-600",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              />
            );
          })}
        </div>
        {error && (
          <p className="text-xs font-sans text-rose-500 text-center animate-in fade-in mt-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);
OtpInput.displayName = "OtpInput";

export { Input, Textarea };
