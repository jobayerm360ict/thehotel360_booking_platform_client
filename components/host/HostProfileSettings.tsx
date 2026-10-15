"use client";

import { platformService } from "@/services/platformService";
import React, { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Loader2,
  Award,
  Star,
  Clock,
  CreditCard,
  Building,
  Save,
  Languages,
} from "lucide-react";
import { FiUser } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, setUser } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
import { useGetMeQuery, useUpdateProfileMutation } from "@/store/api/authApi";
import { HostUpdateProfileSchema } from "@/schemas/authSchema";
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
import {
  HostProfileSkeleton,
  LoadingOverlay,
} from "@/components/common/Skeletons";
import { toast } from "sonner";
import { usePlatformData } from "@/hooks/usePlatformData";

const AVAILABLE_LANGUAGES = [
  "English",
  "Bengali",
  "Hindi",
  "Urdu",
  "Arabic",
  "French",
  "Spanish",
  "Mandarin",
];

export function HostProfileSettings() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: hostMetrics } = usePlatformData(platformService.standards);
  useEffect(() => { platformService.getPayout().then(result => { dispatch(updateProfile({ ...(result.payoutMethod ? { payoutMethod: result.payoutMethod } : {}), taxId: result.taxId, welcomeMessage: result.welcomeMessage })); }).catch(() => undefined); }, [dispatch]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active tab state: Profile details vs Payout settings
  const [activeTab, setActiveTab] = useState<"profile" | "payout">("profile");

  // RTK Query hooks for syncing and updating profile
  const { data: serverProfile, isLoading: isFetchingProfile } = useGetMeQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [updateProfileMutation, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  const resolveNames = (u: typeof currentUser) => {
    let fn = u.firstName || "";
    let ln = u.lastName || "";
    if (fn.toLowerCase() === "host" || fn.toLowerCase() === "guest") fn = "";
    if (ln.toLowerCase() === "user") ln = "";

    if (
      !fn &&
      u.name &&
      u.name.toLowerCase() !== "host user" &&
      u.name.toLowerCase() !== "guest user" &&
      u.name.toLowerCase() !== "host" &&
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

  // Form State (Same as Guest Profile)
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
  const [languages, setLanguages] = useState<string[]>(currentUser.languages ?? []);

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    currentUser.avatar || "",
  );

  // Host Payout & Business States
  const [payoutType, setPayoutType] = useState<"bank" | "bkash" | "paypal">(
    (currentUser.payoutMethod?.type as "bank" | "bkash" | "paypal") || "bank",
  );
  const [bankName, setBankName] = useState(
    currentUser.payoutMethod?.bankName || "",
  );
  const [accountHolder, setAccountHolder] = useState(
    currentUser.payoutMethod?.accountHolder || currentUser.name || "",
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser.payoutMethod?.accountNumber || "",
  );
  const [routingNumber, setRoutingNumber] = useState(
    currentUser.payoutMethod?.routingNumber || "",
  );
  const [taxId, setTaxId] = useState(currentUser.taxId || "");
  const [welcomeMessage, setWelcomeMessage] = useState(
    currentUser.welcomeMessage || "",
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

  // Sync Redux store when serverProfile is returned
  useEffect(() => {
    if (serverProfile) {
      dispatch(setUser(serverProfile));
    }
  }, [serverProfile, dispatch]);

  // Sync state when currentUser updates in Redux
  useEffect(() => {
    const { fn, ln } = resolveNames(currentUser);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the editable form after the authenticated profile is refreshed.
    setFirstName(fn);
    setLastName(ln);
    setDateOfBirth(toInputDateFormat(currentUser.dateOfBirth));
    setGender(currentUser.gender || "");
    setPhone(currentUser.phone || currentUser.e164Phone || "");
    setEmail(currentUser.email || "");
    setAddress(currentUser.location || currentUser.address || "");
    setBio(currentUser.bio || "");
    setAvatarPreview(currentUser.avatar || "");
    setLanguages(currentUser.languages ?? []);
    setTaxId(currentUser.taxId || "");
    setWelcomeMessage(currentUser.welcomeMessage || "");
    if (currentUser.payoutMethod) {
      setPayoutType(
        (currentUser.payoutMethod.type as "bank" | "bkash" | "paypal") ||
          "bank",
      );
      setBankName(currentUser.payoutMethod.bankName || "");
      setAccountHolder(
        currentUser.payoutMethod.accountHolder || currentUser.name || "",
      );
      setAccountNumber(currentUser.payoutMethod.accountNumber || "");
      setRoutingNumber(currentUser.payoutMethod.routingNumber || "");
    }
  }, [currentUser]);

  // Handle avatar image selection directly from file
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

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  // Save Profile (Sends exact same FormData structure as Guest profile)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Zod Schema Validation
    const validationResult = HostUpdateProfileSchema.safeParse({
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
        toast.error(firstErrorMessage, { id: "host-profile-validation-err" });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Build FormData payload (matches Guest Profile format exactly)
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

      // Call RTK Query mutation with FormData
      let res: User | null = null;
      try {
        res = await updateProfileMutation(formData).unwrap();
      } catch (mutationErr: unknown) {
        try {
          res = await authService.updateProfile(formData);
        } catch {
          throw mutationErr;
        }
      }

      // Update Redux state with API returned user
      if (res) {
        dispatch(setUser(res));
      } else {
        dispatch(
          updateProfile({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            dateOfBirth,
            location: address.trim(),
            bio: bio.trim(),
            phone: phone.trim(),
            languages,
            ...(avatarPreview ? { avatar: avatarPreview } : {}),
          }),
        );
      }

      setIsSaved(true);
      toast.success("Host profile updated successfully!", {
        id: "host-profile-update-ok",
      });
      setTimeout(() => {
        setIsSaved(false);
      }, 2500);
    } catch (apiError: unknown) {
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

      const knownFields = [
        "last_name",
        "first_name",
        "date_of_birth",
        "gender",
        "bio",
        "address",
        "phone",
      ];

      const quotedMatch = errorMsg.match(/"([a-zA-Z0-9_]+)"/);
      if (quotedMatch && knownFields.includes(quotedMatch[1])) {
        const fieldName = quotedMatch[1];
        setErrors((prev) => ({
          ...prev,
          [fieldName]: errorMsg,
        }));
      }

      toast.error(errorMsg, { id: "host-profile-api-error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Save Payout Settings
  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try { const payoutMethod = { type: payoutType, bankName, accountHolder, accountNumber, routingNumber, isDefault: true };
      await platformService.payout({ ...payoutMethod, taxId, welcomeMessage }); dispatch(updateProfile({ payoutMethod, taxId, welcomeMessage }));
      toast.success("Payout destination saved successfully.");
    } catch { /* API error toast */ } finally { setIsLoading(false); }
  };

  const handleCancel = () => {
    const { fn, ln } = resolveNames(currentUser);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync the editable form after the authenticated profile is refreshed.
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

  if (
    isFetchingProfile &&
    !serverProfile &&
    !currentUser.email &&
    !currentUser.id
  ) {
    return <HostProfileSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HOST CREDENTIALS & STATS BANNER                                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="relative group shrink-0">
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-brand-primary/20 shadow-xs">
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
                alt={firstName || currentUser.name || "Host"}
              />
              <AvatarFallback className="bg-brand-primary text-white font-heading font-bold text-lg">
                {(firstName ||
                  currentUser.name ||
                  currentUser.email ||
                  "H")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-brand-primary text-white p-1 rounded-full shadow-xs">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {firstName && lastName
                  ? `${firstName} ${lastName}`
                  : currentUser.name || "Host Partner"}
              </h2>
              {hostMetrics?.isSuperhost && <Badge className="bg-brand-secondary text-white font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-none">Superhost</Badge>}
              {currentUser.identityVerified && <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full">ID Verified</Badge>}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-sans">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                Response rate:{" "}
                <strong className="text-emerald-600">{hostMetrics?.responseRate == null ? "No responses yet" : hostMetrics.responseRate + "%"}</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Rating:{" "}
                <strong className="text-neutral-900 dark:text-white">{hostMetrics ? (hostMetrics.reviewCount ? hostMetrics.rating.toFixed(2) : "No reviews yet") : "Loading"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Host Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payout")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "payout"
                ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payout &amp; Banking</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1: HOST PROFILE FORM (Matching Guest Profile Form)                 */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
          {(isLoading || isUpdating) && (
            <LoadingOverlay message="Updating host profile..." />
          )}
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                Host Profile Information
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

          {/* Identity status comes from the authenticated user profile. */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                  {currentUser.identityVerified ? "Host identity verified" : "Host identity not verified"}
                </h4>
              </div>
            </div>
            <Badge className="bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200 border-none text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 shrink-0">
              {currentUser.identityVerified ? "Verified" : "Not verified"}
            </Badge>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Upload Section (Direct form upload - No preset avatars) */}
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
                    alt={firstName || currentUser.name || "Host"}
                  />
                  <AvatarFallback className="bg-brand-primary text-white text-xl font-bold">
                    {(firstName && firstName.toLowerCase() !== "host"
                      ? firstName[0]
                      : currentUser.name &&
                          currentUser.name.toLowerCase() !== "host user"
                        ? currentUser.name[0]
                        : currentUser.email
                          ? currentUser.email[0]
                          : "H"
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
                  Host Profile Picture (Avatar)
                </h3>
                <p className="text-xs text-neutral-500 font-serif mt-0.5">
                  JPG, PNG or WEBP (Max 5MB). Upload your official host portrait
                  photo.
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

              {/* Date of Birth */}
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

              {/* Gender Select */}
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
                  label="Hosting Base / Location"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearError("address");
                  }}
                  placeholder="e.g. Dhaka & Sylhet, Bangladesh"
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

            {/* Languages spoken */}
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-sans font-semibold text-xs mb-1.5">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-brand-primary text-white shadow-xs"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio / About */}
            <div>
              <TextareaField
                label="Host Biography & Philosophy"
                rows={3}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  clearError("bio");
                }}
                error={errors.bio}
                placeholder="Tell guests about your hospitality style, hosting background and passion..."
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
                className="rounded-full px-8 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: PAYOUT & BANKING PREFERENCES                                    */}
      {/* ========================================================================= */}
      {activeTab === "payout" && (
        <form
          onSubmit={handleSavePayout}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in"
        >
          <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="font-heading text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Payout &amp; Banking Preferences</span>
            </h2>
            <p className="text-xs text-neutral-500 font-serif mt-0.5">
              Configure how you receive payouts from bookings and manage your
              tax information.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-sans font-semibold text-xs mb-2">
                Primary Payout Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutType("bank")}
                  className={`p-3 rounded-xl border text-center font-sans font-semibold text-xs transition cursor-pointer ${
                    payoutType === "bank"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  Bank Transfer (EFT)
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutType("bkash")}
                  className={`p-3 rounded-xl border text-center font-sans font-semibold text-xs transition cursor-pointer ${
                    payoutType === "bkash"
                      ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  bKash / Nagad
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutType("paypal")}
                  className={`p-3 rounded-xl border text-center font-sans font-semibold text-xs transition cursor-pointer ${
                    payoutType === "paypal"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  PayPal
                </button>
              </div>
            </div>

            {payoutType === "bank" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <InputField
                    label="Bank Name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. City Bank Bangladesh"
                  />
                </div>

                <div>
                  <InputField
                    label="Account Holder Name"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <InputField
                    label="Account Number / IBAN"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <InputField
                    label="Routing Number / SWIFT"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="CITIBDDH"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <InputField
                  label="Mobile Wallet / Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="+880 1819 887766"
                />
              </div>
            )}

            <div className="pt-2">
              <InputField
                label="Host Taxpayer ID (TIN / VAT)"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="TIN-893021948"
              />
            </div>

            <div>
              <TextareaField
                label="Automated Guest Welcome Message"
                rows={2}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Welcome to our sanctuary! We are excited to host you..."
              />
              <span className="text-[11px] text-neutral-400 font-serif block mt-1">
                Sent automatically to guests when their reservation is
                confirmed.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="submit"
              className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Payout Settings</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
