"use client";

/**
 * Universal Common Input Fields Hub
 * Exporting all shadcn-styled form inputs with unified luxury styling,
 * text-brand-primary left icons, consistent rounded-xl borders, and error handling.
 */

// 1. Base Primitives
export { Input, Textarea } from "@/components/ui/input";
export type { InputProps, TextareaProps } from "@/components/ui/input";

// 2. High-Level Text & Password Inputs
export {
  InputField,
  PasswordInputField,
  EmailInputField,
  TextareaField,
  CurrencyInput,
  SearchInput,
} from "@/components/ui/input";
export type {
  InputFieldProps,
  TextareaFieldProps,
  CurrencyInputProps,
} from "@/components/ui/input";

// 3. Date Picker & Calendar Inputs
export {
  DatePickerField,
  DateInputField,
} from "@/components/ui/input";
export type { DatePickerFieldProps } from "@/components/ui/input";

// 4. Select Dropdowns
export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectField,
} from "@/components/ui/input";
export type { SelectFieldProps, SelectOption } from "@/components/ui/input";

// 5. International Phone Input
export {
  PhoneInputField,
  COUNTRY_PHONE_LIST,
} from "@/components/ui/input";
export type {
  PhoneInputFieldProps,
  CountryOption,
} from "@/components/ui/input";

// 6. OTP Verification Input (6-box symmetric auto-advance)
export { OtpInput } from "@/components/ui/input";
export type { OtpInputProps } from "@/components/ui/input";

// 7. Checkbox & Switch Fields
export {
  CheckboxField,
  SwitchField,
} from "@/components/ui/input";
export type {
  CheckboxFieldProps,
  SwitchFieldProps,
} from "@/components/ui/input";

// ============================================================================
// CONVENIENT COMMON ALIASES (So you can use whatever naming you prefer)
// ============================================================================
export {
  OtpInput as OtpField,
  PasswordInputField as PasswordField,
  EmailInputField as EmailField,
  DatePickerField as DateField,
  PhoneInputField as PhoneField,
  CurrencyInput as PriceField,
  SearchInput as SearchField,
  InputField as TextField,
} from "@/components/ui/input";

// 8. Skeletons & Loading
export { Skeleton } from "@/components/ui/skeleton";
export {
  ProfileFormSkeleton,
  ProfileLayoutSkeleton,
  HostProfileSkeleton,
  HostLayoutSkeleton,
  CardSkeleton,
  TableSkeleton,
  LoadingOverlay,
} from "@/components/common/Skeletons";

// 9. Numeric Steppers & Media Uploads
export { CounterField } from "@/components/common/CounterField";
export type { CounterFieldProps } from "@/components/common/CounterField";
export { ImageUploadField } from "@/components/common/ImageUploadField";
export type {
  ImageUploadFieldProps,
  ImageUploadItem,
} from "@/components/common/ImageUploadField";

