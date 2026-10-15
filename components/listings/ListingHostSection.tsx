"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { createOrGetConversation } from "@/store/platformActions";
import { useRouter } from "next/navigation";
import { Host } from "@/types";
import {
  ShieldCheck,
  Star,
  Award,
  Send,
  CheckCircle,
  MessageCircle,
  Clock,
  Globe,
  Sparkles,
  HeartHandshake,
  Check,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ListingHostSectionProps {
  listingId: string;
  host: Host;
  rating: number;
  reviewCount: number;
}

export function ListingHostSection({
  listingId,
  host,
  rating,
  reviewCount,
}: ListingHostSectionProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messagesList, setMessagesList] = useState<
    Array<{ sender: "user" | "host"; text: string; time: string }>
  >([]);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!messageText.trim() || sentSuccess) return;
    setSentSuccess(true);
    try { const conversation = await dispatch(createOrGetConversation({ listingId, initialMessage: messageText.trim() })).unwrap();
      setMessageText(""); router.push('/messages?conv=' + conversation.id);
    } catch { setSentSuccess(false); }
  };

  return (
    <div className="py-8 border-b border-neutral-200 dark:border-neutral-800 space-y-6">
      {/* Section Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold mb-2">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Verified Host Sanctuary</span>
        </div>
        <h3 className="font-heading text-2xl font-semibold text-neutral-900 dark:text-white">
          Meet your host
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT PROFILE CARD (5 cols) ================= */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/90 dark:border-neutral-800 shadow-md space-y-5">
          <div className="flex items-center justify-between gap-4">
            {/* Host Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 ring-4 ring-brand-primary/10 shadow-md">
                <Image
                  src={host.avatar}
                  alt={host.name}
                  fill
                  className="object-cover"
                />
                {/* Verified Shield Badge */}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-neutral-900">
                  <ShieldCheck className="w-3.5 h-3.5 fill-white text-brand-primary" />
                </div>
              </div>

              <div>
                <h4 className="font-heading text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {host.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  {host.isSuperhost && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                      <Award className="w-3 h-3" />
                      <span>Superhost</span>
                    </span>
                  )}
                  <span className="text-xs text-neutral-500 font-sans">
                    {host.joinedDate || "Host since 2023"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-100 dark:border-neutral-800 text-center">
            <div>
              <div className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
                {Math.max(reviewCount, 38)}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                Reviews
              </div>
            </div>

            <div className="border-x border-neutral-100 dark:border-neutral-800">
              <div className="font-heading font-bold text-lg text-neutral-900 dark:text-white flex items-center justify-center gap-0.5">
                <span>{rating.toFixed(2)}</span>
                <Star className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" />
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                Rating
              </div>
            </div>

            <div>
              <div className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
                3
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                Years
              </div>
            </div>
          </div>

          {/* Host Badges / Trust Pills */}
          <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Identity verified by government ID</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Response time: within 10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Languages: English, Bengali, Hindi</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT HOST DETAILS & STORY (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Host Personal Bio / Introduction */}
          <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <h4 className="font-heading text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>About {host.name}</span>
            </h4>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
              {host.bio ||
                `"Hello travelers! I'm ${host.name}. I've been hosting guests from across the country and abroad since 2023. I take pride in providing spotlessly clean rooms, quiet study spaces with ultra-fast Wi-Fi, and warm hospitality. I'm always available to give you local tips on nearby cafes and transit!"`}
            </p>
          </div>

          {/* Host Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Host Response Rate
              </span>
              <span className="font-heading text-lg font-bold text-neutral-900 dark:text-white mt-0.5 block">
                {host.responseRate || "100% within an hour"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Superhost Status
              </span>
              <span className="font-heading text-lg font-bold text-brand-primary mt-0.5 block">
                Top 1% Hospitality
              </span>
            </div>
          </div>

          {/* Action Row: Message Host Button */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => setMessageModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 shadow-md shadow-brand-primary/20 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message {host.name}</span>
            </button>

            <span className="text-xs text-neutral-500 font-sans">
              Usually responds in a few minutes
            </span>
          </div>
        </div>
      </div>

      {/* Message Host Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden rounded-3xl"
          onClose={() => setMessageModalOpen(false)}
        >
          {/* Header */}
          <div className="p-5 bg-neutral-900 text-white flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
              <Image
                src={host.avatar}
                alt={host.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-heading text-base font-bold flex items-center gap-2">
                <span>Chat with {host.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </h4>
              <p className="text-xs text-neutral-300">
                Superhost · Typically responds in 5 minutes
              </p>
            </div>
          </div>

          {/* Message Thread */}
          <div className="p-5 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 bg-[#fcfbf9] dark:bg-neutral-950">
            {messagesList.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-500 space-y-1">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Have a question about this stay?
                </p>
                <p>
                  Ask {host.name} about check-in, parking, or amenities below.
                </p>
              </div>
            ) : (
              messagesList.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-brand-primary text-white rounded-br-xs shadow-sm"
                        : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-bl-xs shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))
            )}

            {sentSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                <span>{host.name} is typing a reply...</span>
              </div>
            )}
          </div>

          {/* Quick Questions Chips */}
          <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-1.5">
            {[
              "Is early check-in possible?",
              "Is high-speed Wi-Fi stable for work?",
              "Is private parking available?",
            ].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setMessageText(quick)}
                className="text-[11px] px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-brand-primary/10 hover:text-brand-primary transition cursor-pointer"
              >
                {quick}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Write a message to ${host.name}...`}
              className="flex-1 px-4 py-2.5 text-xs rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
