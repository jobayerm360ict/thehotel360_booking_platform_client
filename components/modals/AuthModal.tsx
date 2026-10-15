"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuthModalOpen } from "@/store/slices/uiSlice";
import { login, setUser, fetchCurrentUser } from "@/store/slices/authSlice";
import { Input, OtpInput } from "@/components/common/InputFields";
import { UserRole, AuthApiResponse, OtpResponse, AuthResponse, User, RawApiUser } from "@/types";
import {
  Mail,
  Phone,
  CheckCircle2,
  Building2,
  Compass,
  KeyRound,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";

export function AuthModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAuthModalOpen);

  const [role, setRole] = useState<UserRole>("guest");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  const [resendTimer, setResendTimer] = useState(30);

  // Determine if input is email or phone number
  const isEmail = identifier.trim().includes("@");

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const resetState = () => {
    setIdentifier("");
    setOtp("");
    setStep("input");
    setIsLoading(false);
    setIsSuccess(false);
    setErrorMsg("");
    setSentMessage("");
    setResendTimer(30);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      const msg = "Please enter a valid email address or phone number.";
      setErrorMsg(msg);
      toast.error(msg, { id: "auth-validation" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = isEmail
        ? { email: cleanInput, type: "authenticate_user" }
        : { phone: cleanInput, type: "authenticate_user" };
      const res = await authService.sendOtp(payload);

      if (
        res &&
        (res.success === false ||
          (res as { status?: boolean }).status === false)
      ) {
        const errorText =
          res.message ||
          "Failed to send verification code. Please try again.";
        setErrorMsg(errorText);
        toast.error(errorText, { id: "otp-send-error" });
        return;
      }

      const msg = res?.message || `Verification code sent to ${cleanInput}`;
      setSentMessage(msg);
      toast.success(msg, { id: "otp-sent" });
      setResendTimer(30);
      setStep("otp");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to send verification code. Please check your details and try again.";
      setErrorMsg(msg);
      toast.error(msg, { id: "otp-send-error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const cleanInput = identifier.trim();
      const payload = isEmail
        ? { email: cleanInput, type: "authenticate_user" }
        : { phone: cleanInput, type: "authenticate_user" };
      const res = await authService.sendOtp(payload);

      if (
        res &&
        (res.success === false ||
          (res as { status?: boolean }).status === false)
      ) {
        const errorText =
          res.message || "Failed to resend code. Please try again.";
        setErrorMsg(errorText);
        toast.error(errorText, { id: "otp-resend-err" });
        return;
      }

      const msg = res?.message || `New code sent to ${cleanInput}`;
      toast.success(msg, { id: "otp-resend" });
      setResendTimer(30);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to resend code";
      setErrorMsg(msg);
      toast.error(msg, { id: "otp-resend-err" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanInput = identifier.trim();
    const cleanOtp = otp.trim();

    if (cleanOtp.length < 6) {
      const msg = "Please enter the complete 6-digit verification code.";
      setErrorMsg(msg);
      toast.error(msg, { id: "otp-validation" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = isEmail
        ? { email: cleanInput, otp: cleanOtp, type: "authenticate_user" }
        : { phone: cleanInput, otp: cleanOtp, type: "authenticate_user" };

      const otpResponse = await authService.matchOtp(payload);
      if (otpResponse && otpResponse.success === false) {
        const msg =
          otpResponse.message || "Invalid or expired verification code.";
        setErrorMsg(msg);
        toast.error(msg, { id: "otp-verify-err" });
        return;
      }

      // Format phone to E.164 (+880...) format expected by /auth/user/login
      const formatPhone = (input: string) => {
        const cleaned = input.replace(/[\s-]/g, "");
        if (cleaned.startsWith("+")) return cleaned;
        if (cleaned.startsWith("880")) return `+${cleaned}`;
        if (cleaned.startsWith("0")) return `+88${cleaned}`;
        return `+880${cleaned}`;
      };

      // Call /auth/user/login to obtain official 24-hour user session token with user ID
      let loginResponse: AuthApiResponse | null = null;
      try {
        const loginPayload = isEmail
          ? { email: cleanInput }
          : { phone: formatPhone(cleanInput) };
        loginResponse = await authService.login(loginPayload);
      } catch (loginErr) {
        console.warn(
          "Direct login error, falling back to OTP response:",
          loginErr,
        );
      }

      await executeLogin(loginResponse || otpResponse);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Verification code is invalid or expired. Please check and try again.";
      setErrorMsg(msg);
      toast.error(msg, { id: "otp-verify-err" });
    } finally {
      setIsLoading(false);
    }
  };

  const executeLogin = async (
    resData?: AuthApiResponse | OtpResponse | AuthResponse | Record<string, unknown> | null
  ) => {
    setIsSuccess(true);
    const cleanInput = identifier.trim();
    const dataObj =
      resData && typeof resData === "object"
        ? (resData as Record<string, unknown>)
        : null;
    const nestedData =
      dataObj?.data && typeof dataObj.data === "object"
        ? (dataObj.data as Record<string, unknown>)
        : null;

    // Store token and refreshToken if returned by API response
    const token =
      (typeof dataObj?.token === "string" ? dataObj.token : undefined) ||
      (typeof dataObj?.accessToken === "string"
        ? dataObj.accessToken
        : undefined) ||
      (typeof nestedData?.token === "string" ? nestedData.token : undefined) ||
      (typeof nestedData?.accessToken === "string"
        ? nestedData.accessToken
        : undefined);
    if (token && typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }

    const refreshToken =
      (typeof dataObj?.refreshToken === "string"
        ? dataObj.refreshToken
        : undefined) ||
      (typeof dataObj?.refresh_token === "string"
        ? dataObj.refresh_token
        : undefined) ||
      (typeof nestedData?.refreshToken === "string"
        ? nestedData.refreshToken
        : undefined) ||
      (typeof nestedData?.refresh_token === "string"
        ? nestedData.refresh_token
        : undefined);
    if (refreshToken && typeof window !== "undefined") {
      localStorage.setItem("refreshToken", refreshToken);
    }

    let returnedUser: RawApiUser | User | null = null;
    if (dataObj) {
      if (dataObj.user && typeof dataObj.user === "object") {
        returnedUser = dataObj.user as RawApiUser | User;
      } else if (nestedData) {
        if (nestedData.user && typeof nestedData.user === "object") {
          returnedUser = nestedData.user as RawApiUser | User;
        } else if (
          "email" in nestedData ||
          "name" in nestedData ||
          "first_name" in nestedData ||
          "id" in nestedData ||
          "phone" in nestedData
        ) {
          returnedUser = nestedData as unknown as RawApiUser | User;
        }
      } else if (
        !dataObj.token &&
        ("email" in dataObj ||
          "name" in dataObj ||
          "first_name" in dataObj ||
          "id" in dataObj)
      ) {
        returnedUser = dataObj as unknown as RawApiUser | User;
      }
    }

    // Fetch official full profile directly from /auth/user/profile (getMe)
    if (token) {
      try {
        const me = await authService.getMe();
        if (me) {
          returnedUser = me;
        }
      } catch (e: unknown) {
        console.warn("Could not fetch user profile via getMe:", e);
      }
    }

    if (returnedUser) {
      dispatch(setUser(returnedUser));
    } else {
      dispatch(
        login({
          name: isEmail ? cleanInput.split("@")[0] : cleanInput,
          email: isEmail ? cleanInput : undefined,
          phone: !isEmail ? cleanInput : undefined,
          role: role,
        }),
      );
    }

    // Refresh current user in Redux
    dispatch(fetchCurrentUser());

    // Show server success message in toast
    const successMsg =
      (typeof dataObj?.message === "string" ? dataObj.message : undefined) ||
      "You are now logged in";
    toast.success(successMsg, { id: "auth-login-success" });

    setTimeout(() => {
      resetState();
      dispatch(setAuthModalOpen({ open: false }));
    }, 1200);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetState();
        dispatch(setAuthModalOpen({ open }));
      }}
    >
      <DialogContent
        className="max-w-[480px] p-7 sm:p-10 rounded-[32px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl transition-all duration-300"
        onClose={() => {
          resetState();
          dispatch(setAuthModalOpen({ open: false }));
        }}
      >
        {/* Symmetric Centered Header */}
        <DialogHeader className="p-0 border-none pb-5 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl bg-brand-primary-light/60 dark:bg-brand-primary/15 text-brand-primary flex items-center justify-center mx-auto mb-3.5 ring-1 ring-brand-primary/25 shadow-xs transition-transform duration-300 hover:scale-105">
            {step === "otp" ? (
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>
          <DialogTitle className="text-2xl font-heading font-bold text-neutral-900 dark:text-white tracking-tight">
            {step === "input" ? "Welcome to Travistay" : "Verify OTP Code"}
          </DialogTitle>
          <p className="text-xs sm:text-sm font-serif text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {step === "input"
              ? "Enter your email or mobile number to receive a secure one-time verification code."
              : "We've sent a 6-digit verification code. Please enter it below to proceed."}
          </p>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <p className="font-heading font-bold text-xl text-neutral-900 dark:text-white">
              Signed in successfully!
            </p>
            <p className="text-xs sm:text-sm font-serif text-neutral-500 max-w-xs mx-auto">
              Welcome back to Travistay. Setting up your personalized sanctuary
              experience...
            </p>
          </div>
        ) : step === "input" ? (
          /* Step 1: Input Identifier Form */
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2 text-left">
              <label className="text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-300 block">
                Email or Mobile Phone
              </label>
              <div className="relative">
                {isEmail ? (
                  <Mail className="w-4 h-4 text-brand-primary absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                ) : (
                  <Phone className="w-4 h-4 text-brand-primary absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                )}
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="Email or Phone"
                  className="h-12 pl-11 pr-4 text-sm font-sans font-medium rounded-2xl border-neutral-200/90 dark:border-neutral-700 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-2xs"
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-sans text-rose-500 font-medium text-center animate-in fade-in">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full h-12 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans font-semibold rounded-2xl text-sm shadow-xl shadow-brand-primary/20 hover:shadow-2xl hover:shadow-brand-primary/30 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <span>Continue with Verification Code</span>
              )}
            </button>

            {/* Symmetrical Relaxed Footer */}
            <p className="text-[11px] font-serif text-neutral-400 dark:text-neutral-500 text-center pt-2 leading-relaxed">
              By continuing, you agree to Travistay&apos;s{" "}
              <span className="text-neutral-600 dark:text-neutral-300 underline underline-offset-2">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-neutral-600 dark:text-neutral-300 underline underline-offset-2">
                Privacy Policy
              </span>
              .
            </p>
          </form>
        ) : (
          /* Step 2: 6-Box OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* Symmetrical Recipient Chip */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/70 dark:border-neutral-700/70">
              <div className="flex items-center gap-2.5 truncate">
                {isEmail ? (
                  <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                ) : (
                  <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                )}
                <span className="text-xs font-sans font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {identifier}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setErrorMsg("");
                }}
                className="text-xs font-sans font-semibold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change</span>
              </button>
            </div>

            {/* 6 Individual OTP Boxes Component */}
            <div className="space-y-3 py-1">
              <label className="text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-300 block text-center">
                Enter the 6-digit verification code
              </label>
              <OtpInput
                length={6}
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (errorMsg) setErrorMsg("");
                }}
                error={errorMsg}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Resend Action with Countdown */}
            <div className="text-center text-xs font-sans">
              {resendTimer > 0 ? (
                <p className="text-neutral-400 dark:text-neutral-500 font-serif">
                  Didn&apos;t receive code? Resend in{" "}
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    {resendTimer}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-brand-primary font-semibold hover:underline cursor-pointer transition disabled:opacity-50"
                >
                  Resend verification code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.trim().length < 6}
              className="w-full h-12 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans font-semibold rounded-2xl text-sm shadow-xl shadow-brand-primary/20 hover:shadow-2xl hover:shadow-brand-primary/30 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & Continue</span>
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
