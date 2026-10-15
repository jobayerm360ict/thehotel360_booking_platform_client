"use client";

import React from "react";
import {
  MapPin,
  Users,
  Calendar,
  Wallet,
  Star,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";

const ICONS: Record<string, LucideIcon> = {
  MapPin, Users, Calendar, Wallet, Star, ShieldCheck, Sparkles,
};

const ICON_STYLES = [
  "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40 text-emerald-600",
  "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40 text-rose-600",
  "bg-purple-50/80 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40 text-purple-600",
  "bg-blue-50/80 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-blue-600",
];

export function WhyChooseUs() {
  const { data, loading, error, reload } = usePlatformData(platformService.homeContent);
  const { locale } = useParams<{ locale: string }>();
  const language = locale === "bn" ? "bn" : "en";
  const benefits = data?.benefits || [];

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-rose-100/30 via-pink-100/20 to-blue-100/20 dark:from-rose-950/20 dark:via-purple-950/15 dark:to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-primary/10 dark:bg-brand-primary/50 border border-brand-primary/60 dark:border-brand-primary/50 text-brand-primary text-xs font-sans font-semibold tracking-wide shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" />
            <span>Why Choose Us</span>
          </div>

          {/* Main Heading */}
          {data?.settings?.benefitsHeading && <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {data.settings.benefitsHeading[language] || data.settings.benefitsHeading.en}
          </h2>}

          {/* Underline Glow Accent */}
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent mx-auto rounded-full mt-2 opacity-80" />
        </div>

        {loading && <p role="status" className="text-center text-sm text-neutral-500">Loading benefits...</p>}
        {error && <div role="alert" className="text-center text-sm text-rose-600">Unable to load benefits. <button type="button" onClick={reload} className="underline">Try again</button></div>}
        {!loading && !error && benefits.length === 0 && <p className="text-center text-sm text-neutral-500">No benefits are published yet.</p>}

        {!loading && !error && benefits.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {benefits.map((card, index) => {
            const Icon = ICONS[card.icon] || Sparkles;
            return (
            <div
              key={card.id}
              className="group relative flex flex-col justify-between rounded-3xl border-2 border-transparent bg-white p-6 shadow-lg shadow-brand-primary/5 ring-1 ring-brand-primary/20 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-xl dark:bg-neutral-900 dark:hover:border-brand-primary sm:p-7"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${ICON_STYLES[index % ICON_STYLES.length]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="font-heading font-black text-3xl sm:text-4xl text-neutral-200/80 dark:text-neutral-800 select-none tracking-tight">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-neutral-900 dark:text-white leading-snug mb-3 group-hover:text-brand-primary transition-colors">
                  {card.title[language] || card.title.en}
                </h3>

                <p className="text-xs sm:text-[13px] font-sans text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                  {card.description[language] || card.description.en}
                </p>
              </div>
            </div>
          );})}
        </div>}
      </div>
    </section>
  );
}
