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
  Tag,
  Mail,
  User as UserIcon,
  ArrowRight,
  Filter,
  MessageSquare,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveHostConversation,
  sendMessage,
  markAsRead,
} from "@/store/slices/messagesSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface HostChatViewProps {
  embedded?: boolean;
}

export function HostChatView({ embedded = false }: HostChatViewProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const user = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector((state) => state.messages.conversations);
  const activeConvId = useAppSelector(
    (state) => state.messages.activeHostConversationId,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<
    "all" | "confirmed" | "inquiry" | "unread"
  >("all");
  const [inputText, setInputText] = useState("");
  const [showRightDossier, setShowRightDossier] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Conversations are already scoped to the authenticated user by the API.
  const hostConversations = useMemo(() => conversations.filter(c => c.hostId === user.id), [conversations, user.id]);

  // Read conversation from URL param if available
  useEffect(() => {
    const urlConvId = searchParams.get("conv");
    if (urlConvId && hostConversations.some((c) => c.id === urlConvId)) {
      dispatch(setActiveHostConversation(urlConvId));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open the URL-selected conversation on mobile.
      setMobileShowThread(true);
    } else if (
      !activeConvId &&
      hostConversations.length > 0 &&
      hostConversations[0]?.id
    ) {
      dispatch(setActiveHostConversation(hostConversations[0].id));
    }
  }, [searchParams, hostConversations, activeConvId, dispatch]);

  // Current active conversation
  const currentConversation = useMemo(() => {
    return (
      hostConversations.find((c) => c.id === activeConvId) ||
      hostConversations[0] ||
      null
    );
  }, [hostConversations, activeConvId]);

  // Mark as read when opening conversation as host
  useEffect(() => {
    if (currentConversation && currentConversation.unreadCountForHost > 0) {
      dispatch(
        markAsRead({
          conversationId: currentConversation.id,
          role: "host",
        }),
      );
    }
  }, [currentConversation?.id, currentConversation?.unreadCountForHost, dispatch]);

  // Auto-scroll ONLY inside the chat messages container (NEVER scroll the whole window/page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentConversation?.messages]);

  // Filter conversations by tab and search
  const filteredConversations = useMemo(() => {
    let list = hostConversations;

    if (filterTab === "confirmed") {
      list = list.filter((c) => c.status === "confirmed");
    } else if (filterTab === "inquiry") {
      list = list.filter((c) => c.status === "inquiry");
    } else if (filterTab === "unread") {
      list = list.filter((c) => c.unreadCountForHost > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.guestName.toLowerCase().includes(q) ||
          c.listingTitle.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q),
      );
    }

    return list;
  }, [hostConversations, filterTab, searchQuery]);

  // Send message handler
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || !currentConversation) return;

    try { await dispatch(
      sendMessage({
        conversationId: currentConversation.id,
        senderId: user.id || "host",
        senderName: user.name || "Host",
        senderAvatar: user.avatar,
        senderRole: "host",
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
    dispatch(setActiveHostConversation(convId));
    setMobileShowThread(true);
  };

  const totalUnread = hostConversations.reduce(
    (acc, c) => acc + c.unreadCountForHost,
    0,
  );

  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col md:flex-row relative ${
        embedded
          ? "h-[calc(100vh-170px)] min-h-[500px] sm:h-[680px] md:h-[740px]"
          : "h-[calc(100vh-7.5rem)] min-h-[550px] max-h-[880px]"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. LEFT: HOST INBOX & GUEST INQUIRY LIST                                  */}
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
                Guest Inquiries
              </h2>
            </div>
            {totalUnread > 0 ? (
              <Badge className="bg-brand-primary text-white font-sans text-[10px] px-2 py-0.2 rounded-full border-none">
                {totalUnread} New
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] font-sans text-neutral-500 border-neutral-200 dark:border-neutral-700 py-0"
              >
                All caught up
              </Badge>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {(
              [
                { id: "all", label: "All" },
                { id: "confirmed", label: "Confirmed" },
                { id: "inquiry", label: "Inquiries" },
                { id: "unread", label: "Unread" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition shrink-0 cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-brand-primary text-white shadow-2xs"
                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest, stay, or message..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-sans text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-sans text-neutral-400">
                No conversations match your filter.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === currentConversation?.id;
              const hasUnread = conv.unreadCountForHost > 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-2.5 sm:p-3 flex items-start gap-2.5 cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-white dark:bg-neutral-800/90 shadow-2xs border-l-4 border-l-brand-primary"
                      : "hover:bg-white/70 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10 sm:w-10.5 sm:h-10.5 ring-2 ring-brand-primary/20">
                      <AvatarImage
                        src={conv.guestAvatar}
                        alt={conv.guestName}
                      />
                      <AvatarFallback className="bg-brand-secondary text-white font-sans text-xs">
                        {conv.guestName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.guestVerified && (
                      <span
                        title="Verified Guest ID"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs border-2 border-white dark:border-neutral-900"
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4
                          className={`text-xs sm:text-sm font-heading truncate ${
                            hasUnread
                              ? "font-bold text-neutral-900 dark:text-white"
                              : "font-semibold text-neutral-800 dark:text-neutral-200"
                          }`}
                        >
                          {conv.guestName}
                        </h4>
                      </div>
                      <span className="text-[10px] font-sans text-neutral-400 shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-sans">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1.5 py-0 border-none font-bold uppercase ${
                          conv.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {conv.status}
                      </Badge>
                      <span className="text-neutral-500 dark:text-neutral-400 truncate">
                        {conv.listingTitle.split("|")[0]}
                      </span>
                    </div>

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

        {/* Host Control Bar Footnote */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-200/70 dark:border-neutral-800 text-[11px] font-sans text-neutral-500 flex items-center justify-between">
          <span className="truncate">Host Command Suite • {user.name}</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Host
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTER: HOST ACTIVE CHAT THREAD                                        */}
      {/* ========================================================================= */}
      {currentConversation ? (
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-neutral-900 min-w-0 ${
            !mobileShowThread ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Active Conversation Header */}
          <div className="p-2.5 sm:p-3 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-2.5 bg-[#fcfbf9]/40 dark:bg-neutral-900/40">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setMobileShowThread(false)}
                className="md:hidden p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
                aria-label="Back to conversations"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 ring-2 ring-brand-primary/20">
                  <AvatarImage
                    src={currentConversation.guestAvatar}
                    alt={currentConversation.guestName}
                  />
                  <AvatarFallback className="bg-brand-primary text-white font-heading font-bold text-xs">
                    {currentConversation.guestName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                    {currentConversation.guestName}
                  </h3>
                  {currentConversation.guestVerified && (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-sans font-semibold px-2 py-0.2"
                    >
                      Verified Guest
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] font-sans text-neutral-400 truncate flex items-center gap-2">
                  <span>
                    {currentConversation.guestEmail || "Email not provided"}
                  </span>
                  {currentConversation.guestPhone && (
                    <>
                      <span>•</span>
                      <span>{currentConversation.guestPhone}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/listings/${currentConversation.listingId}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:border-brand-primary hover:text-brand-primary transition"
              >
                <span>Sanctuary</span>
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
                title="Toggle Guest Dossier & Reservation info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Property & Reservation Context Strip */}
          <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200/70 dark:border-neutral-700/70 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {currentConversation.listingTitle}
              </span>
              {currentConversation.checkIn && (
                <span className="text-neutral-500 hidden sm:inline">
                  • Stay: {currentConversation.checkIn} to{" "}
                  {currentConversation.checkOut} ({currentConversation.guestsCount === undefined ? "Guest count unavailable" : currentConversation.guestsCount + " guests"})
                </span>
              )}
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0 pl-2">
              Nightly rate: {formatPrice(currentConversation.listingPrice)}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fcfbf9]/40 dark:bg-neutral-950/40"
          >
            {/* Messages Thread */}
            {currentConversation.messages.map((msg) => {
              const isHost = msg.senderRole === "host";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isHost ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${
                      isHost ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isHost && (
                      <Avatar className="w-7 h-7 shrink-0 ring-1 ring-neutral-200">
                        <AvatarImage
                          src={
                            msg.senderAvatar || currentConversation.guestAvatar
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
                          isHost
                            ? "bg-brand-primary text-white rounded-br-xs"
                            : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Special Quick Action Cards */}
                        {msg.quickAction && (
                          <div
                            className={`mt-2.5 p-3 rounded-xl border text-xs ${
                              isHost
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
                          isHost ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isHost && (
                          <span
                            title={msg.read ? "Read by guest" : "Delivered"}
                          >
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

          {/* Message Input Box */}
          <div className="p-2 sm:p-2.5 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-end gap-2 bg-[#fcfbf9] dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl p-1.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Reply to guest ${currentConversation.guestName}... (Enter to send)`}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm font-sans text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none max-h-28 py-1 px-2"
              />

              <Button
                type="button"
                disabled={!inputText.trim()}
                onClick={() => handleSend()}
                className="h-8 w-8 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center p-0 shrink-0 shadow-xs transition disabled:opacity-40 cursor-pointer"
                aria-label="Send reply"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-[9px] font-sans text-neutral-400 mt-1 px-1">
              Replying as {user.name || "Host"} • Press Enter to send
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
            <MessageSquare className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-neutral-800 dark:text-neutral-200">
            No Guest Conversation Selected
          </h3>
          <p className="text-xs font-serif text-neutral-500 max-w-sm">
            Select a guest inquiry from the list on the left to read and reply.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RIGHT: GUEST & STAY DOSSIER FOR HOST                                  */}
      {/* ========================================================================= */}
      {currentConversation && showRightDossier && (
        <>
          {/* Mobile / Tablet / Laptop Backdrop */}
          <div
            onClick={() => setShowRightDossier(false)}
            className="2xl:hidden absolute inset-0 bg-neutral-950/40 backdrop-blur-xs z-30 transition-opacity cursor-pointer"
          />

          {/* Slide-over Drawer on <2xl, in-flow on 2xl */}
          <div className="absolute inset-y-0 right-0 z-40 w-full sm:w-76 2xl:relative 2xl:w-76 border-l border-neutral-200/80 dark:border-neutral-800 p-3.5 bg-white dark:bg-neutral-900 2xl:bg-[#fcfbf9]/90 2xl:dark:bg-neutral-900/90 overflow-y-auto space-y-3 shadow-2xl 2xl:shadow-none animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/70 dark:border-neutral-800">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                Guest &amp; Stay Dossier
              </h4>
              <button
                type="button"
                onClick={() => setShowRightDossier(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Guest Identity Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-brand-primary/20">
                  <AvatarImage
                    src={currentConversation.guestAvatar}
                    alt={currentConversation.guestName}
                  />
                  <AvatarFallback>
                    {currentConversation.guestName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h5 className="font-heading font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {currentConversation.guestName}
                  </h5>
                  {currentConversation.guestVerified && (
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-sans text-[10px] border-emerald-200">
                      Verified Traveler
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-700/60 text-xs font-sans text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">
                    {currentConversation.guestEmail || "Email not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>
                    {currentConversation.guestPhone || "Phone not provided"}
                  </span>
                </div>
                {currentConversation.guestVerified && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Guest identity verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reservation Breakdown */}
            {currentConversation.checkIn && (
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold uppercase text-[10px] text-brand-secondary">
                    Booking Details
                  </span>
                  <Badge
                    className={
                      currentConversation.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-none"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-none"
                    }
                  >
                    {currentConversation.status === "confirmed"
                      ? "Confirmed"
                      : "Inquiry"}
                  </Badge>
                </div>

                <div className="space-y-1 text-neutral-700 dark:text-neutral-300 font-serif">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-sans">
                      Check-in:
                    </span>
                    <span className="font-medium">
                      {currentConversation.checkIn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-sans">
                      Check-out:
                    </span>
                    <span className="font-medium">
                      {currentConversation.checkOut}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-sans">Guests:</span>
                    <span className="font-medium">
                      {currentConversation.guestsCount === undefined ? "Not provided" : currentConversation.guestsCount + " guests"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between font-sans"><span className="text-neutral-500">Nightly rate:</span><span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatPrice(currentConversation.listingPrice)}</span></div>
              </div>
            )}

            {/* Quick Host Actions */}
            <div className="space-y-2">
              <h6 className="font-sans font-bold uppercase text-[10px] text-brand-secondary">
                Host Actions
              </h6>
              <Link
                href="/host"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-sans font-semibold text-neutral-700 dark:text-neutral-200 hover:border-brand-primary hover:text-brand-primary transition"
              >
                <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                <span>View Dashboard &amp; Stays</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
