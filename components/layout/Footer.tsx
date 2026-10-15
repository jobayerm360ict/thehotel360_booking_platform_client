"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Heart,
  Lock,
  Headphones,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
// import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Footer() {
  const pathname = usePathname();

  // Hide consumer marketing footer on host suite, live chat rooms, and search split map view
  if (
    pathname?.startsWith("/host") ||
    pathname?.startsWith("/guest/messages") ||
    pathname?.includes("/search")
  ) {
    return null;
  }

  return (
    <footer className="relative border-t border-neutral-200/80 bg-[#f8f6f0] dark:bg-neutral-950 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 mt-auto overflow-hidden">
      {/* Soft Ambient Radial Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-brand-primary/5 blur-3xl pointer-events-none rounded-full" />

      {/* Top Value Badges Bar */}

      {/* Main Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Identity & Mission (Left Column) */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image src="/logoFD.png" alt="Logo" width={200} height={40} />
            </Link>

            <p className="font-serif text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-sm">
              Travistay curates exceptional architectural villas, secluded tea
              estate bungalows, and coastal sanctuaries crafted for slow travel
              and contemplative luxury.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-sans font-semibold text-neutral-700 dark:text-neutral-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Operating across Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Right 3 Columns) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Featured Escapes */}
            <div className="space-y-4">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Sanctuary Escapes
              </h4>
              <ul className="space-y-2.5 text-xs font-serif font-light">
                <li>
                  <Link
                    href="/search?location=Sreemangal"
                    className="hover:text-brand-primary transition-colors flex items-center gap-1"
                  >
                    <span>Sreemangal Tea Estates</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?location=Inani"
                    className="hover:text-brand-primary transition-colors flex items-center gap-1"
                  >
                    <span>Inani Beachfront Villas</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?location=Sajek"
                    className="hover:text-brand-primary transition-colors flex items-center gap-1"
                  >
                    <span>Sajek Valley Cloud Cabins</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?location=Gulshan"
                    className="hover:text-brand-primary transition-colors flex items-center gap-1"
                  >
                    <span>Gulshan Urban Penthouses</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?location=Sundarbans"
                    className="hover:text-brand-primary transition-colors flex items-center gap-1"
                  >
                    <span>Sundarbans Eco Retreats</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-brand-primary font-sans font-semibold hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>View All Stays</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Journal & Host Portal */}
            <div className="space-y-4">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Journal &amp; Hosting
              </h4>
              <ul className="space-y-2.5 text-xs font-serif font-light">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-brand-primary font-medium text-neutral-900 dark:text-white transition-colors flex items-center gap-1"
                  >
                    <span>The Travistay Journal</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-brand-primary/10 text-brand-primary text-[9px] font-sans font-bold">
                      Stories
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host/create"
                    className="hover:text-brand-primary transition-colors font-medium text-brand-primary"
                  >
                    <span>List a Sanctuary</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>Host Portal &amp; Calendar</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>Superhost Standards</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>Host Protection Guarantee</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Concierge & Support */}
            <div className="space-y-4">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Guest Support
              </h4>
              <ul className="space-y-2.5 text-xs font-serif font-light">
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-brand-primary font-semibold text-brand-primary transition-colors flex items-center gap-1"
                  >
                    <span>Help Center &amp; FAQs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>Check-in &amp; ID Guidelines</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>Flexible Cancellation Terms</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>My Profile &amp; Wishlists</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trips"
                    className="hover:text-brand-primary transition-colors"
                  >
                    <span>Manage My Bookings</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Language & Currency */}
      <div className="border-t border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-100/60 dark:bg-neutral-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-neutral-500 dark:text-neutral-400">
            <span>© 2026 Travistay Inc.</span>
            <span>·</span>
            <Link
              href="/faq"
              className="hover:underline hover:text-neutral-900 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <span>·</span>
            <Link
              href="/faq"
              className="hover:underline hover:text-neutral-900 dark:hover:text-white"
            >
              Terms of Service
            </Link>
            <span>·</span>
            <Link
              href="/blog"
              className="hover:underline hover:text-neutral-900 dark:hover:text-white"
            >
              Editorial Sitemap
            </Link>
          </div>

          <div className="flex items-center gap-3 font-medium text-neutral-800 dark:text-neutral-200">
            <LanguageToggle variant="compact" />
            {/* <ThemeToggle variant="icon" /> */}
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
              <span className="text-[11px] font-sans font-semibold">$ USD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
