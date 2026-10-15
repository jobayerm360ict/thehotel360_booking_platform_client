"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Loader2,
  Calendar,
} from "lucide-react";
import { FiUser } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { setUser } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
import { useGetMeQuery, useUpdateProfileMutation } from "@/store/api/authApi";
import { GuestUpdateProfileSchema } from "@/schemas/authSchema";
import { User } from "@/types";
import {
  InputField,
  PhoneInputField,
  TextareaField,
  DatePickerField,
  SelectField,
} from "@/components/common/InputFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { imageHostLink } from "@/constants/request";
import { RiGenderlessLine } from "react-icons/ri";
import { toast } from "sonner";

import { ProfileFormSkeleton, LoadingOverlay } from "@/components/common/Skeletons";

export function ProfileInfoTab() {
  const { isBengali } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query Hooks for profile query and mutation with automatic tag invalidation
  const {
    data: serverProfile,
    isLoading: isFetchingProfile,
    refetch: refetchProfile,
  } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateProfileMutation, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  const resolveNames = (u: typeof currentUser) => {
    let fn = u.firstName || "";
    let ln = u.lastName || "";
    if (fn.toLowerCase() === "guest") fn = "";
    if (ln.toLowerCase() === "user") ln = "";

    if (
      !fn &&
      u.name &&
      u.name.toLowerCase() !== "guest user" &&
      u.name.toLowerCase() !== "guest"
    ) {
      const parts = u.name.split(" ");
      fn = parts[0] || u.name;
      if (!ln && parts.length > 1) {
        ln = parts.slice(1).join(" ");
      }
    } else if (!fn && u.email) {
      fn = u.email.split("@")[0];
    }
    return { fn, ln };
  };

  const toInputDateFormat = (val?: string): string => {
    if (!val) return "";
    const clean = val.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
      const [d, m, y] = clean.split("-");
      return `${y}-${m}-${d}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
    return clean;
  };

  const toApiDateFormat = (val?: string): string => {
    if (!val) return "";
    const clean = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
      const [d, m, y] = clean.split("-");
      return `${y}-${m}-${d}`;
    }
    return clean;
  };

  const initial = resolveNames(currentUser);

  // Form State
  const [firstName, setFirstName] = useState(initial.fn);
  const [lastName, setLastName] = useState(initial.ln);
  const [dateOfBirth, setDateOfBirth] = useState(
    toInputDateFormat(currentUser.dateOfBirth),
  );
  const [gender, setGender] = useState<string>(currentUser.gender || "");
  const [phone, setPhone] = useState(
    currentUser.phone || currentUser.e164Phone || "",
  );
  const [email, setEmail] = useState(currentUser.email || "");
  const [address, setAddress] = useState(
    currentUser.location || currentUser.address || "",
  );
  const [bio, setBio] = useState(currentUser.bio || "");

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    currentUser.avatar || "",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Sync Redux store when serverProfile is returned or refetched by RTK Query
  useEffect(() => {
    if (serverProfile) {
      dispatch(setUser(serverProfile));
    }
  }, [serverProfile, dispatch]);

  // Sync state when currentUser updates in Redux
  useEffect(() => {
    const { fn, ln } = resolveNames(currentUser);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Rehydrate the editable fields when the saved profile changes.
    setFirstName(fn);
    setLastName(ln);
    setDateOfBirth(toInputDateFormat(currentUser.dateOfBirth));
    setGender(currentUser.gender || "");
    setPhone(currentUser.phone || currentUser.e164Phone || "");
    setEmail(currentUser.email || "");
    setAddress(currentUser.location || currentUser.address || "");
    setBio(currentUser.bio || "");
    setAvatarPreview(currentUser.avatar || "");
  }, [currentUser]);

  // Handle avatar image selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Zod Schema Validation
    const validationResult = GuestUpdateProfileSchema.safeParse({
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      gender,
      bio,
      address,
      avatar: avatarFile || avatarPreview,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString();
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      const firstErrorMessage = Object.values(fieldErrors)[0];
      if (firstErrorMessage) {
        toast.error(firstErrorMessage, { id: "profile-validation-err" });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Build FormData payload as requested
      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());
      if (dateOfBirth) {
        formData.append("date_of_birth", toApiDateFormat(dateOfBirth));
      }
      if (gender) {
        formData.append("gender", gender);
      }
      if (bio.trim()) {
        formData.append("bio", bio.trim());
      }
      if (address.trim()) {
        formData.append("address", address.trim());
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // Save through the existing account API, then reload the canonical profile.
      try {
        await updateProfileMutation(formData).unwrap();
      } catch {
        await authService.updateProfile(formData);
      }
      dispatch(setUser(await authService.getMe()));
      setIsSaved(true);
      toast.success("Profile updated successfully!", { id: "profile-update-ok" });
      setTimeout(() => {
        setIsSaved(false);
      }, 2500);
    } catch (apiError: unknown) {
      // Extract error message from API response
      let errorMsg = "Failed to update profile. Please check the inputs.";
      if (apiError && typeof apiError === "object") {
        const errObj = apiError as Record<string, unknown>;
        const dataObj =
          errObj.data && typeof errObj.data === "object"
            ? (errObj.data as Record<string, unknown>)
            : null;

        if (dataObj && typeof dataObj.message === "string") {
          errorMsg = dataObj.message;
        } else if (typeof errObj.message === "string") {
          errorMsg = errObj.message;
        }
      }

      // Check if API error belongs to a specific field (e.g. backend Joi: `"last_name" is not allowed to be empty`)
      const knownFields = [
        "last_name",
        "first_name",
        "date_of_birth",
        "gender",
        "bio",
        "address",
        "phone",
      ];
      let fieldMatched = false;

      const quotedMatch = errorMsg.match(/"([a-zA-Z0-9_]+)"/);
      if (quotedMatch && knownFields.includes(quotedMatch[1])) {
        const fieldName = quotedMatch[1];
        const humanName = fieldName
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const friendlyMessage = errorMsg.replace(`"${fieldName}"`, humanName);
        setErrors((prev) => ({ ...prev, [fieldName]: friendlyMessage }));
        toast.error(friendlyMessage, { id: "profile-api-field-error" });
        fieldMatched = true;
      } else {
        for (const f of knownFields) {
          if (errorMsg.toLowerCase().includes(f)) {
            setErrors((prev) => ({ ...prev, [f]: errorMsg }));
            toast.error(errorMsg, { id: "profile-api-field-error" });
            fieldMatched = true;
            break;
          }
        }
      }

      if (!fieldMatched) {
        toast.error(errorMsg, { id: "profile-api-error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const { fn, ln } = resolveNames(currentUser);
    setFirstName(fn);
    setLastName(ln);
    setDateOfBirth(toInputDateFormat(currentUser.dateOfBirth));
    setGender(currentUser.gender || "");
    setPhone(currentUser.phone || currentUser.e164Phone || "");
    setEmail(currentUser.email || "");
    setAddress(currentUser.location || currentUser.address || "");
    setBio(currentUser.bio || "");
    setAvatarFile(null);
    setAvatarPreview(currentUser.avatar || "");
    setErrors({});
  };

  if (isFetchingProfile && !serverProfile && !currentUser.email && !currentUser.id) {
    return <ProfileFormSkeleton />;
  }

  return (
    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5 animate-fade-in">
      {(isLoading || isUpdating) && (
        <LoadingOverlay message="Saving profile changes..." />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            Personal Information
          </h1>
          {isFetchingProfile && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-sans font-medium animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing profile...</span>
            </div>
          )}
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-sans font-semibold border border-emerald-200/60 dark:border-emerald-800 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile Updated Successfully</span>
          </div>
        )}
      </div>

      {/* Identity verification status from the account API */}
      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={"w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 " + (currentUser.identityVerified ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500")}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
              {currentUser.identityVerified ? (isBengali ? "পরিচয় যাচাইকৃত" : "Identity Verified") : (isBengali ? "পরিচয় যাচাই করা হয়নি" : "Identity not verified")}
            </h4>
            <p className="text-[11px] font-serif text-neutral-500 dark:text-neutral-400 font-light">
              {currentUser.identityVerified
                ? (isBengali ? "আপনার পরিচয় যাচাইয়ের অবস্থা সক্রিয়।" : "Your identity verification is active.")
                : (isBengali ? "আপনার পরিচয় এখনো যাচাই করা হয়নি।" : "Your identity has not been verified.")}
            </p>
          </div>
        </div>
        <Badge className={currentUser.identityVerified
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-none text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 shrink-0"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border-none text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 shrink-0"}>
          {currentUser.identityVerified ? (isBengali ? "সক্রিয়" : "Active") : (isBengali ? "যাচাই হয়নি" : "Unverified")}
        </Badge>
      </div>
      {/* Main Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
          <div className="relative group">
            <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-neutral-800 shadow-md">
              <AvatarImage
                src={
                  avatarPreview
                    ? avatarPreview.startsWith("http") ||
                      avatarPreview.startsWith("data:") ||
                      avatarPreview.startsWith("/")
                      ? avatarPreview
                      : `${imageHostLink}/${avatarPreview}`
                    : ""
                }
                alt={firstName || currentUser.name}
              />
              <AvatarFallback className="bg-brand-primary text-white text-xl font-bold">
                {(firstName && firstName.toLowerCase() !== "guest"
                  ? firstName[0]
                  : currentUser.name &&
                      currentUser.name.toLowerCase() !== "guest user"
                    ? currentUser.name[0]
                    : currentUser.email
                      ? currentUser.email[0]
                      : "U"
                ).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-primary text-white shadow-md hover:bg-brand-primary-hover transition cursor-pointer"
              title="Change avatar photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-neutral-900 dark:text-white">
              Profile Picture (avatar)
            </h3>
            <p className="text-xs text-neutral-500 font-serif mt-0.5">
              JPG, PNG or WEBP (Max 5MB). Upload a clear profile image.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-sans font-semibold text-brand-primary hover:underline mt-1 cursor-pointer block"
            >
              Upload New Photo
            </button>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <InputField
              label="First Name"
              required
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearError("first_name");
              }}
              error={errors.first_name}
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
          </div>

          <div>
            <InputField
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearError("last_name");
              }}
              error={errors.last_name}
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
          </div>

          {/* Date of Birth (Shadcn Popover Calendar Component) */}
          <DatePickerField
            label="Date of Birth"
            value={dateOfBirth}
            onChange={(val) => {
              setDateOfBirth(val);
              clearError("date_of_birth");
            }}
            error={errors.date_of_birth}
            className="w-full"
            containerClassName="w-full"
          />

          {/* Gender Select (Shadcn Common Component) */}
          <SelectField
            label="Gender"
            value={gender}
            onChange={(val) => {
              setGender(val);
              clearError("gender");
            }}
            placeholder="Select Gender"
            error={errors.gender}
            className="w-full"
            leftIcon={<FiUser className="w-4 h-4" />}
            containerClassName="w-full"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />

          <div>
            <InputField
              label="Address / Location"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                clearError("address");
              }}
              placeholder="e.g. House 42, Road 11, Gulshan, Dhaka"
              error={errors.address}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div>
            <PhoneInputField
              label="Phone Number"
              value={phone}
              disabled={true}
              error={errors.phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearError("phone");
              }}
            />
          </div>
        </div>

        {/* Bio / About */}
        <div>
          <TextareaField
            label="Bio (About Yourself)"
            rows={3}
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              clearError("bio");
            }}
            error={errors.bio}
            placeholder="Tell us a little bit about yourself and your travel philosophy..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isUpdating}
            className="rounded-full px-6 text-xs font-sans font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isUpdating}
            className="rounded-full px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs hover:shadow-md flex items-center gap-2"
          >
            {isLoading || isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
