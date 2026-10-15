"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { AvatarModal } from "@/components/profile/AvatarModal";

import { ProfileLayoutSkeleton } from "@/components/common/Skeletons";

interface ProfileLayoutWrapperProps {
  children: React.ReactNode;
}

export function ProfileLayoutWrapper({ children }: ProfileLayoutWrapperProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Wait for client hydration before reading browser auth state.
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token")
          : null;
      if (!isAuthenticated && !token) {
        router.push("/");
      }
    }
  }, [isMounted, isAuthenticated, router]);

  const handleSelectAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const updatedUser = await authService.updateProfile(formData);
      dispatch(setUser(updatedUser));
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your profile photo.");
      throw error;
    }
  };

  if (!isMounted || !isAuthenticated) {
    return <ProfileLayoutSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-1 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Navigation Sidebar (Desktop + Mobile Responsive) */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 self-start">
            <ProfileSidebar
              onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
            />
          </aside>

          {/* Right Main Content Slot */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">{children}</main>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarModal
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        currentAvatar={currentUser.avatar}
        onSelectAvatar={handleSelectAvatar}
      />
    </div>
  );
}
