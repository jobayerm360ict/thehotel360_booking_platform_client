"use client";

import React, { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { PasswordInputField } from "@/components/common/InputFields";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";

export function ProfileSecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!currentPassword) {
      toast.error("Enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must contain at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not change password.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          Security settings
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Change your password using your current account credentials.
        </p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-primary" />
          <span>Change password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PasswordInputField
            label="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
          />
          <PasswordInputField
            label="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
          <PasswordInputField
            label="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !currentPassword ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
            className="rounded-full px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-sans font-semibold disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}