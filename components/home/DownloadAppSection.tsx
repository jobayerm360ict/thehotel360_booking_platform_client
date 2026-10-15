"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { QrCode, Smartphone, Star } from "lucide-react";

export function DownloadAppSection() {
  return (
    <section className="relative py-6 sm:py-8 md:py-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-brand-primary/10 dark:bg-brand-primary/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-gradient-to-br from-white via-[#faf8f5] to-brand-primary-light/10 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-neutral-800/80 border border-brand-primary/20 dark:border-neutral-800 p-5 sm:p-8 md:p-12 lg:p-16 shadow-xl shadow-brand-primary/5 overflow-hidden">
          {/* Subtle Decorative Pattern Background */}
          <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 z-10 text-center sm:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[11px] sm:text-xs font-sans font-semibold tracking-wide shadow-2xs">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Mobile Experience</span>
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.2]">
                  Download, Search &amp;{" "}
                  <span className="text-brand-primary block sm:inline">
                    Book Your Perfect Place
                  </span>
                </h2>
                <p className="font-serif text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-300 font-light max-w-lg leading-relaxed pt-1 mx-auto sm:mx-0">
                  Download the Travistay app to explore curated stays, unlock
                  exclusive member rates, and effortlessly manage your journeys
                  anytime, anywhere.
                </p>
              </div>

              {/* App Store & Play Store Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                {/* Apple App Store */}
                <Link
                  href="#"
                  className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 bg-neutral-950 hover:bg-neutral-800 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-neutral-800"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.03.62-2.66 1.36-.56.64-.99 1.68-.86 2.7 1.01.08 2.05-.53 2.6-1.21z" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] sm:text-[10px] uppercase font-sans tracking-wider leading-none text-neutral-400">
                      Download on
                    </span>
                    <span className="text-xs sm:text-sm font-sans font-bold leading-tight mt-0.5 whitespace-nowrap">
                      App Store
                    </span>
                  </div>
                </Link>

                {/* Google Play Store */}
                <Link
                  href="#"
                  className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 bg-neutral-950 hover:bg-neutral-800 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-neutral-800"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.95 1.95 0 0 1-.61-.749V2.563c.174-.298.39-.564.609-.749zm11.24 11.24l2.583-2.583-11.4-6.582 8.817 9.165zm0 1.892l-8.817 9.165 11.4-6.582-2.583-2.583zm1.057-1.057l3.208 1.852c.983.568 1.543.344 1.769-.327a1.69 1.69 0 0 0 .117-.61V9.04c0-.214-.041-.423-.117-.61-.226-.671-.786-.895-1.769-.327l-3.208 1.852z" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] sm:text-[10px] uppercase font-sans tracking-wider leading-none text-neutral-400">
                      GET IT ON
                    </span>
                    <span className="text-xs sm:text-sm font-sans font-bold leading-tight mt-0.5 whitespace-nowrap">
                      Google Play
                    </span>
                  </div>
                </Link>
              </div>

              {/* QR Code and Direct Scan Arrow Indicator (Desktop/Tablet only) */}
              <div className="hidden sm:flex items-center gap-5 pt-2">
                {/* QR Code Card with brand-primary border */}
                <div className="relative group p-2 rounded-2xl bg-white dark:bg-neutral-950 border-2 border-brand-primary shadow-md shadow-brand-primary/15 transition-transform duration-300 hover:scale-105 shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center bg-white p-1 rounded-xl">
                    {/* Styled QR Code SVG */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      fill="currentColor"
                    >
                      {/* Outer Position Markers */}
                      <path d="M5,5 h30 v30 h-30 z M10,10 v20 h20 v-20 z M15,15 h10 v10 h-10 z" />
                      <path d="M65,5 h30 v30 h-30 z M70,10 v20 h20 v-20 z M75,15 h10 v10 h-10 z" />
                      <path d="M5,65 h30 v30 h-30 z M10,70 v20 h20 v-20 z M15,75 h10 v10 h-10 z" />
                      {/* Authentic QR code patterns */}
                      <rect x="42" y="8" width="8" height="8" />
                      <rect x="52" y="16" width="6" height="12" />
                      <rect x="42" y="24" width="10" height="6" />
                      <rect x="8" y="42" width="12" height="6" />
                      <rect x="24" y="42" width="8" height="10" />
                      <rect x="14" y="52" width="6" height="8" />
                      <rect
                        x="42"
                        y="42"
                        width="16"
                        height="16"
                        fill="#1a73e8"
                      />
                      <rect x="46" y="46" width="8" height="8" fill="white" />
                      <rect x="65" y="42" width="10" height="6" />
                      <rect x="80" y="42" width="15" height="6" />
                      <rect x="70" y="52" width="8" height="10" />
                      <rect x="84" y="52" width="10" height="8" />
                      <rect x="42" y="65" width="8" height="12" />
                      <rect x="54" y="65" width="10" height="6" />
                      <rect x="48" y="75" width="14" height="6" />
                      <rect x="42" y="85" width="6" height="10" />
                      <rect x="65" y="65" width="10" height="10" />
                      <rect x="80" y="65" width="15" height="10" />
                      <rect x="70" y="80" width="12" height="15" />
                      <rect x="86" y="80" width="9" height="15" />
                    </svg>
                  </div>
                </div>

                {/* Scan Arrow & Prompt */}
                <div className="flex flex-col space-y-1 text-left text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5 font-sans font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                    <QrCode className="w-4 h-4 text-brand-primary" />
                    <span>Scan QR code</span>
                  </div>
                  <p className="text-xs font-serif font-light text-neutral-500 max-w-[160px] leading-snug">
                    Point your camera to download instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Right Phone Mockup Column */}
            <div className="lg:col-span-6 relative flex items-center justify-center mt-2 lg:mt-0">
              {/* Backlight Glow Behind Phones */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 via-brand-primary/10 to-transparent blur-2xl rounded-full transform scale-90 -z-10" />

              {/* Transparent Mockup Image */}
              <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[480px] transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="/app.svg"
                  alt="Travistay Mobile App Experience"
                  width={600}
                  height={620}
                  priority
                  className="w-full h-auto object-contain drop-shadow-xl"
                />

                {/* Floating Rating Pill Micro-Badge */}
                <div className="absolute bottom-2 left-1 sm:bottom-6 sm:left-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-lg flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-heading font-bold text-xs sm:text-sm text-neutral-900 dark:text-white leading-tight">
                      4.9 / 5.0
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-sans text-neutral-500 leading-none">
                      12,400+ reviews
                    </span>
                  </div>
                </div>

                {/* Floating Instant Sync Micro-Badge */}
                <div className="absolute top-2 right-1 sm:top-6 sm:right-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 border border-neutral-200/80 dark:border-neutral-800 shadow-lg flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-heading font-semibold text-[11px] sm:text-xs text-neutral-900 dark:text-white whitespace-nowrap">
                    Instant Confirmations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
