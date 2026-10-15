"use client";

import React, { useState } from "react";
import {
  CalendarX,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  Info,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ListingThingsToKnowProps {
  cancellationPolicy: string;
  rules: string[];
  maxGuests: number;
}

export function ListingThingsToKnow({
  cancellationPolicy,
  rules,
  maxGuests,
}: ListingThingsToKnowProps) {
  const [modalTopic, setModalTopic] = useState<
    "cancellation" | "rules" | "safety" | null
  >(null);

  return (
    <div className="py-10 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
      <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
        Things to know
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* ================= 1. CANCELLATION POLICY ================= */}
        <div className="space-y-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-900 dark:text-white">
            <CalendarX className="w-6 h-6 stroke-[1.75]" />
          </div>

          <h4 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
            Cancellation policy
          </h4>

          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            <p>
              {cancellationPolicy ||
                "Free cancellation before check-in. Cancel before check-in for a partial refund."}
            </p>
            <p className="text-xs text-neutral-500">
              Review this host&apos;s full policy for details.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setModalTopic("cancellation")}
              className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-white underline hover:text-neutral-600 dark:hover:text-neutral-300 transition cursor-pointer"
            >
              <span>Learn more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================= 2. HOUSE RULES ================= */}
        <div className="space-y-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-900 dark:text-white">
            <KeyRound className="w-6 h-6 stroke-[1.75]" />
          </div>

          <h4 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
            House rules
          </h4>

          <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            <p>
              {rules && rules[0] ? rules[0] : "Check-in after 2:00 PM"}
            </p>
            <p>Checkout before 11:00 AM</p>
            <p>{maxGuests} guests maximum</p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setModalTopic("rules")}
              className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-white underline hover:text-neutral-600 dark:hover:text-neutral-300 transition cursor-pointer"
            >
              <span>Learn more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================= 3. SAFETY & PROPERTY ================= */}
        <div className="space-y-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-900 dark:text-white">
            <ShieldAlert className="w-6 h-6 stroke-[1.75]" />
          </div>

          <h4 className="font-heading text-base font-semibold text-neutral-900 dark:text-white">
            Safety &amp; property
          </h4>

          <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            <p>Carbon monoxide alarm not reported</p>
            <p>Smoke alarm installed</p>
            <p>Exterior security cameras in hallways</p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setModalTopic("safety")}
              className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-white underline hover:text-neutral-600 dark:hover:text-neutral-300 transition cursor-pointer"
            >
              <span>Learn more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(modalTopic)}
        onOpenChange={(open) => !open && setModalTopic(null)}
      >
        <DialogContent
          className="max-w-md p-6 rounded-3xl"
          onClose={() => setModalTopic(null)}
        >
          {modalTopic === "cancellation" && (
            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
                Cancellation Policy Details
              </h4>
              <div className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                <p>
                  <strong>Flexible 48-Hour Guarantee:</strong> Guests can cancel
                  up to 48 hours before check-in for a full refund of the base
                  nightly fee.
                </p>
                <p>
                  Cancellations within 48 hours of check-in are subject to a one
                  night fee plus cleaning and service charges.
                </p>
                <p>
                  For unforeseen extenuating circumstances (e.g. flight
                  disruptions or natural emergencies), Travistay support offers
                  special protection.
                </p>
              </div>
            </div>
          )}

          {modalTopic === "rules" && (
            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
                House Rules &amp; Guidelines
              </h4>
              <div className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                <p>• Quiet hours: 10:00 PM – 8:00 AM</p>
                <p>• No unauthorized parties, large gatherings, or commercial events</p>
                <p>• Smoking indoors is strictly prohibited</p>
                <p>• Maximum registered guests: {maxGuests}</p>
                <p>• Please take off shoes at the entryway</p>
              </div>
            </div>
          )}

          {modalTopic === "safety" && (
            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold text-neutral-900 dark:text-white">
                Safety &amp; Property Information
              </h4>
              <div className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                <p>
                  <strong>Smoke Detector:</strong> Fitted in bedroom and living
                  hallway.
                </p>
                <p>
                  <strong>Carbon Monoxide:</strong> Not reported. Property uses
                  all-electric induction cooking and electrical heating.
                </p>
                <p>
                  <strong>Security:</strong> 24/7 building CCTV security guard at
                  entrance lobby.
                </p>
                <p>
                  <strong>First Aid:</strong> First aid kit and emergency contact
                  sheet located under the entryway cabinet.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
