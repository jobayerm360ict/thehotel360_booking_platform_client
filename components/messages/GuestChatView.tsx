"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Search,
  Sparkles,
  Phone,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Info,
  CheckCheck,
  Check,
  MapPin,
  ExternalLink,
  KeyRound,
  FileText,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveGuestConversation,
  sendMessage,
  markAsRead,
} from "@/store/slices/messagesSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const GUEST_QUICK_QUESTIONS = [
  "Is early check-in available?",
  "What is the Wi-Fi speed & connection quality?",
  "Can I park my vehicle safely inside?",
  "Could you send driving directions from the airport?",
  "Are there quiet work areas with power outlets?",
];

export function GuestChatView() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const user = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector((state) => state.messages.conversations);
  const activeConvId = useAppSelector(
    (state) => state.messages.activeGuestConversationId,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showRightDossier, setShowRightDossier] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter conversations for the current guest user
  const guestConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.guestId === user.id ||
        c.guestEmail === user.email,
    );
  }, [conversations, user.id, user.email]);

  // Read conversation from URL param if available
  useEffect(() => {
    const urlConvId = searchParams.get("conv");
    if (urlConvId && guestConversations.some((c) => c.id === urlConvId)) {
      dispatch(setActiveGuestConversation(urlConvId));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open the URL-selected conversation on mobile.
      setMobileShowThread(true);
    } else if (
      !activeConvId &&
      guestConversations.length > 0 &&
      guestConversations[0]?.id
    ) {
      dispatch(setActiveGuestConversation(guestConversations[0].id));
    }
  }, [searchParams, guestConversations, activeConvId, dispatch]);

  // Current active conversation
  const currentConversation = useMemo(() => {
    return (
      guestConversations.find((c) => c.id === activeConvId) ||
      guestConversations[0] ||
      null
    );
  }, [guestConversations, activeConvId]);

  // Mark as read when opening conversation
  useEffect(() => {
    if (currentConversation && currentConversation.unreadCountForGuest > 0) {
      dispatch(
        markAsRead({
          conversationId: currentConversation.id,
          role: "guest",
        }),
      );
    }
  }, [currentConversation?.id, currentConversation?.unreadCountForGuest, dispatch]);

  // Auto-scroll ONLY inside the chat messages container (NEVER scroll the whole window/page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentConversation?.messages]);

  // Search filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return guestConversations;
    const q = searchQuery.toLowerCase();
    return guestConversations.filter(
      (c) =>
        c.hostName.toLowerCase().includes(q) ||
        c.listingTitle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [guestConversations, searchQuery]);

  // Send message handler
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || !currentConversation) return;

    try { await dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        senderId: user.id || "guest",
        senderName: user.name || "Guest",
        senderAvatar: user.avatar,
        senderRole: "guest",
        text,
      }),
    ).unwrap(); } catch { return; }

    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (convId: string) => {
    dispatch(setActiveGuestConversation(convId));
    setMobileShowThread(true);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col md:flex-row relative h-[calc(100vh-7.5rem)] min-h-[520px] max-h-[880px]">
      {/* ========================================================================= */}
      {/* 1. LEFT CONVERSATIONS INBOX LIST                                          */}
      {/* ========================================================================= */}
      <div
        className={`w-full md:w-60 lg:w-64 xl:w-76 border-r border-neutral-200/80 dark:border-neutral-800 flex flex-col bg-[#fcfbf9]/60 dark:bg-neutral-900/60 shrink-0 ${
          mobileShowThread ? "hidden md:flex" : "flex flex-1 md:flex-initial"
        }`}
      >
        {/* Header */}
        <div className="p-3 sm:p-3.5 border-b border-neutral-200/70 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                Host Chats
              </h2>
            </div>
            <Badge className="bg-brand-primary text-white font-sans text-[10px] px-2 py-0.2 rounded-full border-none">
              {guestConversations.reduce(
                (acc, c) => acc + c.unreadCountForGuest,
                0,
              )}{" "}
              unread
            </Badge>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search host or sanctuary..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-sans text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-sans text-neutral-400">
                No active host conversations found.
              </p>
              <Link
                href="/listings"
                className="inline-block text-xs font-sans font-semibold text-brand-primary hover:underline"
              >
                Browse Sanctuaries &amp; Message Host
              </Link>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === currentConversation?.id;
              const hasUnread = conv.unreadCountForGuest > 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3.5 sm:p-4 flex items-start gap-3 cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-white dark:bg-neutral-800/90 shadow-2xs border-l-4 border-l-brand-primary"
                      : "hover:bg-white/70 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 ring-2 ring-brand-primary/20">
                      <AvatarImage src={conv.hostAvatar} alt={conv.hostName} />
                      <AvatarFallback className="bg-brand-secondary text-white font-sans text-xs">
                        {conv.hostName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.hostIsSuperhost && (
                      <span
                        title="Superhost"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center text-[9px] font-bold shadow-xs border-2 border-white dark:border-neutral-900"
                      >
                        ★
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs sm:text-sm font-heading truncate ${
                          hasUnread
                            ? "font-bold text-neutral-900 dark:text-white"
                            : "font-semibold text-neutral-800 dark:text-neutral-200"
                        }`}
                      >
                        {conv.hostName}
                      </h4>
                      <span className="text-[10px] font-sans text-neutral-400 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[11px] font-sans text-brand-secondary font-medium truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{conv.listingTitle}</span>
                    </p>

                    <p
                      className={`text-xs font-serif truncate line-clamp-1 ${
                        hasUnread
                          ? "font-medium text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>

                  {hasUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Guest Footnote / Switcher Info */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-200/70 dark:border-neutral-800 text-[11px] font-sans text-neutral-500 flex items-center justify-between">
          <span className="truncate">Messaging as {user.name}</span>
          <span className="text-brand-primary font-semibold">Guest View</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER ACTIVE CHAT THREAD                                              */}
      {/* ========================================================================= */}
      {currentConversation ? (
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-neutral-900 min-w-0 ${
            !mobileShowThread ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Active Conversation Header */}
          <div className="p-3.5 sm:p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 bg-[#fcfbf9]/40 dark:bg-neutral-900/40">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setMobileShowThread(false)}
                className="md:hidden p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
                aria-label="Back to conversations"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <Avatar className="w-10 h-10 sm:w-11 sm:h-11 ring-2 ring-brand-primary/20">
                  <AvatarImage
                    src={currentConversation.hostAvatar}
                    alt={currentConversation.hostName}
                  />
                  <AvatarFallback className="bg-brand-primary text-white font-heading font-bold text-xs">
                    {currentConversation.hostName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                    {currentConversation.hostName}
                  </h3>
                  {currentConversation.hostIsSuperhost && (
                    <Badge className="bg-brand-secondary text-white font-sans text-[10px] font-semibold px-2 py-0.2 rounded-full border-none">
                      Superhost
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] font-sans text-neutral-400 truncate">
                  {currentConversation.hostResponseTime
                    ? "Response time: " + currentConversation.hostResponseTime
                    : "Response time not available"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link
                href={`/listings/${currentConversation.listingId}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:border-brand-primary hover:text-brand-primary transition"
              >
                <span>View Sanctuary</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setShowRightDossier(!showRightDossier)}
                className={`p-2 rounded-xl border transition ${
                  showRightDossier
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
                title="Toggle sanctuary details"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Sanctuary Banner Context */}
          <div className="px-4 py-2 bg-brand-primary/5 dark:bg-neutral-800/40 border-b border-brand-primary/10 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {currentConversation.listingTitle}
              </span>
              {currentConversation.checkIn && (
                <span className="text-neutral-400 hidden sm:inline">
                  • {currentConversation.checkIn} to{" "}
                  {currentConversation.checkOut}
                </span>
              )}
            </div>
            <span className="text-brand-primary font-bold shrink-0 pl-2">
              {formatPrice(currentConversation.listingPrice)}/night
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fcfbf9]/40 dark:bg-neutral-950/40"
          >
            {/* Conversation Introduction */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 text-center max-w-md mx-auto space-y-2 shadow-2xs">
              <p className="font-heading font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                Protected Direct Messaging
              </p>
              <p className="font-serif text-xs text-neutral-500 font-light">
                Always communicate and complete bookings via Travistay to remain
                protected under our Sanctuary Guarantee and Guest Refund Policy.
              </p>
            </div>

            {/* Message Bubbles */}
            {currentConversation.messages.map((msg) => {
              const isGuest = msg.senderRole === "guest";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isGuest ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${
                      isGuest ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isGuest && (
                      <Avatar className="w-7 h-7 shrink-0 ring-1 ring-neutral-200">
                        <AvatarImage
                          src={
                            msg.senderAvatar || currentConversation.hostAvatar
                          }
                          alt={msg.senderName}
                        />
                        <AvatarFallback className="text-[10px]">
                          {msg.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="space-y-1">
                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                          isGuest
                            ? "bg-brand-primary text-white rounded-br-xs"
                            : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Special Quick Action Cards (e.g. Check-in guide sent by host) */}
                        {msg.quickAction && (
                          <div
                            className={`mt-2.5 p-3 rounded-xl border text-xs ${
                              isGuest
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                              <span>{msg.quickAction.title}</span>
                            </div>
                            {msg.quickAction.details && (
                              <p className="font-mono text-[11px] opacity-90">
                                {msg.quickAction.details}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-[10px] font-sans text-neutral-400 px-1 ${
                          isGuest ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isGuest && (
                          <span title={msg.read ? "Read" : "Delivered"}>
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 text-brand-primary inline" />
                            ) : (
                              <Check className="w-3 h-3 text-neutral-400 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Prompts Carousel for Guest */}
          <div className="px-4 py-2 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[10px] font-sans font-bold uppercase text-brand-secondary shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Questions:
            </span>
            {GUEST_QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-brand-primary-light hover:text-brand-primary text-neutral-600 dark:text-neutral-300 text-[11px] font-sans whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-2 sm:p-2.5 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-end gap-2 bg-[#fcfbf9] dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl p-1.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Write message to ${currentConversation.hostName}... (Enter to send)`}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm font-sans text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none max-h-28 py-1 px-2"
              />

              <Button
                type="button"
                disabled={!inputText.trim()}
                onClick={() => handleSend()}
                className="h-8 w-8 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center p-0 shrink-0 shadow-xs transition disabled:opacity-40 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-[9px] font-sans text-neutral-400 mt-1 px-1">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
            <MessageSquare className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-neutral-800 dark:text-neutral-200">
            No Active Conversation Selected
          </h3>
          <p className="text-xs font-serif text-neutral-500 max-w-sm">
            Select an existing host from your inbox on the left, or visit any
            sanctuary page to message a host directly.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RIGHT COLLAPSIBLE SANCTUARY & HOST DOSSIER                             */}
      {/* ========================================================================= */}
      {currentConversation && showRightDossier && (
        <>
          {/* Mobile / Tablet / Laptop Backdrop */}
          <div
            onClick={() => setShowRightDossier(false)}
            className="2xl:hidden absolute inset-0 bg-neutral-950/40 backdrop-blur-xs z-30 transition-opacity cursor-pointer"
          />

          {/* Drawer on < 2xl, side-by-side on 2xl */}
          <div className="absolute inset-y-0 right-0 z-40 w-full sm:w-76 2xl:relative 2xl:w-76 border-l border-neutral-200/80 dark:border-neutral-800 p-3.5 bg-white dark:bg-neutral-900 2xl:bg-[#fcfbf9]/90 2xl:dark:bg-neutral-900/90 overflow-y-auto space-y-3 shadow-2xl 2xl:shadow-none animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70 dark:border-neutral-800">
              <h4 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                Stay &amp; Sanctuary Details
              </h4>
              <button
                type="button"
                onClick={() => setShowRightDossier(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Property Image & Title */}
            <div className="space-y-3">
              <div className="relative h-36 rounded-2xl overflow-hidden shadow-xs">
                <Image
                  src={currentConversation.listingImage}
                  alt={currentConversation.listingTitle}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-neutral-900/80 text-white font-sans text-[10px] backdrop-blur-xs border-none">
                  {formatPrice(currentConversation.listingPrice)} / night
                </Badge>
              </div>

              <div>
                <h5 className="font-heading font-bold text-sm text-neutral-900 dark:text-white line-clamp-2">
                  {currentConversation.listingTitle}
                </h5>
                <p className="text-xs font-sans text-neutral-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span>{currentConversation.listingLocation}</span>
                </p>
              </div>
            </div>

            {/* Reservation Status Card */}
            {currentConversation.checkIn && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold uppercase text-[10px] text-brand-secondary">
                    Reservation Dates
                  </span>
                  <Badge
                    className={
                      currentConversation.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-none"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-none"
                    }
                  >
                    {currentConversation.status === "confirmed"
                      ? "Confirmed Stay"
                      : "Inquiry / Pending"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-serif">
                  <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>
                    {currentConversation.checkIn} —{" "}
                    {currentConversation.checkOut}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-neutral-500 font-sans text-[11px]">
                  <span>Guests: {currentConversation.guestsCount === undefined ? "Not provided" : currentConversation.guestsCount}</span>
                  <Link
                    href="/trips"
                    className="text-brand-primary font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>All Trips</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Host Credentials */}
            <div className="space-y-3">
              <h6 className="font-sans font-bold uppercase text-[10px] text-brand-secondary">
                Host details
              </h6>
              <div className="space-y-2 text-xs font-sans text-neutral-600 dark:text-neutral-300">

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>
                    {currentConversation.hostResponseTime ||
                      "Response time not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <Link
                href={`/listings/${currentConversation.listingId}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-sans font-semibold shadow-xs hover:bg-brand-primary-hover transition"
              >
                <span>Explore Sanctuary Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
