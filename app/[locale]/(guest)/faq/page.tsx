"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  HelpCircle,
  MessageCircle,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { usePlatformData } from "@/hooks/usePlatformData";
import { platformService } from "@/services/platformService";

export default function FaqPage() {
  const { data: categories, loading, error, reload } = usePlatformData(platformService.faqs);
  const FAQ_CATEGORIES = categories || [];
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openQuestionIds, setOpenQuestionIds] = useState<number[]>([]);

  const toggleQuestion = (id: number) => {
    setOpenQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id],
    );
  };

  const expandAll = () => {
    const allIds = FAQ_CATEGORIES.flatMap((c) => c.questions.map((q) => q.id));
    setOpenQuestionIds(allIds);
  };

  const collapseAll = () => {
    setOpenQuestionIds([]);
  };

  // Filter questions based on category and search query
  const filteredCategories = useMemo(() => {
    return FAQ_CATEGORIES.map((cat) => {
      if (selectedCategory !== "all" && cat.id !== selectedCategory) {
        return null;
      }

      const matchingQuestions = cat.questions.filter((q) => {
        if (!searchQuery.trim()) return true;
        const qText = q.question[lang].toLowerCase();
        const aText = q.answer[lang].toLowerCase();
        const query = searchQuery.toLowerCase();
        return qText.includes(query) || aText.includes(query);
      });

      if (matchingQuestions.length === 0) return null;

      return {
        ...cat,
        questions: matchingQuestions,
      };
    }).filter(Boolean) as typeof FAQ_CATEGORIES;
  }, [selectedCategory, searchQuery, lang]);

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.questions.length,
    0,
  );

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-neutral-500 hover:text-brand-primary dark:text-neutral-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "en" ? "Back to Home" : "হোমে ফিরে যান"}</span>
        </Link>

        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-sans font-bold uppercase tracking-wider shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Help & Support Center" : "সহায়তা কেন্দ্র"}</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {lang === "en" ? "Frequently Asked Questions" : "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী"}
          </h1>

          <p className="font-serif text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light max-w-lg mx-auto">
            {lang === "en"
              ? "Everything you need to know about booking, check-in, verified amenities, security, and house guidelines."
              : "বুকিং, চেক-ইন, সুযোগ-সুবিধা, নিরাপত্তা ও নিয়মাবলী সংক্রান্ত সমস্ত প্রয়োজনীয় তথ্য এক নজরে।"}
          </p>

          {/* Language Toggle & Search Bar Container */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5 justify-center max-w-lg mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Search questions (e.g. Wi-Fi, check-in, bKash)..."
                    : "প্রশ্ন খুঁজুন (যেমন: ওয়াইফাই, চেক-ইন, পেমেন্ট)..."
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs sm:text-sm font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:text-white shadow-2xs"
              />
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full text-xs font-sans font-bold transition-all ${
                  lang === "en"
                    ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`px-3 py-1 rounded-full text-xs font-sans font-bold transition-all ${
                  lang === "bn"
                    ? "bg-white dark:bg-neutral-900 text-brand-primary shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                বাং
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters & Expand Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold shrink-0 transition-all ${
                selectedCategory === "all"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {lang === "en" ? "All Categories" : "সকল ক্যাটাগরি"}
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {cat.title[lang]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-sans font-semibold text-neutral-500 hover:text-brand-primary underline cursor-pointer"
            >
              {lang === "en" ? "Expand All" : "সব খুলুন"}
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-sans font-semibold text-neutral-500 hover:text-brand-primary underline cursor-pointer"
            >
              {lang === "en" ? "Collapse All" : "সব বন্ধ করুন"}
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-400">
          {totalResults} {lang === "en" ? "Questions Available" : "টি প্রশ্ন পাওয়া গেছে"}
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-6">
          {loading && <p role="status" className="text-sm text-neutral-500">Loading questions...</p>}
          {error && <p role="alert" className="text-sm text-rose-600">Unable to load questions. <button type="button" onClick={reload} className="underline">Try again</button></p>}
          {!loading && !error && filteredCategories.length === 0 && <p className="text-sm text-neutral-500">{FAQ_CATEGORIES.length ? "No questions match your search." : "No questions are published yet."}</p>}
          {!loading && !error && filteredCategories.map((category) => (
            <div key={category.id} className="space-y-2.5">
              <h3 className="font-heading font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-brand-primary" />
                <span>{category.title[lang]}</span>
              </h3>

              <div className="space-y-2">
                {category.questions.map((q) => {
                  const isOpen = openQuestionIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border transition-all duration-150 ${
                        isOpen
                          ? "bg-white dark:bg-neutral-900 border-brand-primary/30 shadow-xs p-4"
                          : "bg-white/80 dark:bg-neutral-900/60 border-neutral-200/70 dark:border-neutral-800 p-3 hover:border-brand-primary/40 hover:bg-white"
                      }`}
                    >
                      <div
                        onClick={() => toggleQuestion(q.id)}
                        className="flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-sans font-bold text-[11px] text-neutral-400 shrink-0">
                            {q.id < 10 ? `0${q.id}` : q.id}
                          </span>
                          <h4 className="font-heading font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white">
                            {q.question[lang]}
                          </h4>
                        </div>

                        <button
                          type="button"
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isOpen
                              ? "bg-brand-primary text-white"
                              : "bg-brand-primary/10 text-brand-primary hover:scale-105"
                          }`}
                        >
                          {isOpen ? (
                            <Minus className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-150">
                          <p className="font-serif text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                            {q.answer[lang]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 24/7 Concierge Support Banner */}
        <div className="rounded-2xl bg-neutral-900 text-white p-6 sm:p-8 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-heading font-bold text-xl text-white">
              {lang === "en"
                ? "Still have questions?"
                : "আরও কিছু জানতে চান?"}
            </h3>
            <p className="font-serif text-xs text-neutral-400 max-w-md font-light">
              {lang === "en"
                ? "Our 24/7 customer support team is always ready to assist you with instant answers."
                : "আমাদের সার্বক্ষণিক সাপোর্ট টিম যেকোনো জিজ্ঞাসা বা সহায়তার জন্য সর্বদা প্রস্তুত।"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://wa.me/8801325912538"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-full shadow-sm transition hover:scale-105"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>

            <a
              href="tel:+8801325912538"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-full shadow-sm transition hover:scale-105"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Concierge</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
